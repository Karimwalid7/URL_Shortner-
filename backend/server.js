// backend/server.js
import express from "express";
import { Pool } from "pg";
import { nanoid } from "nanoid";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import * as promClient from 'prom-client';  // Added for Prometheus metrics

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`; // Override via env in both setups

// --- Prometheus Metrics Setup ---
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom counters
const shortenedUrlsTotal = new promClient.Counter({
  name: 'shortened_urls_total',
  help: 'Number of URLs successfully shortened',
  registers: [register],
});

const successfulRedirectsTotal = new promClient.Counter({
  name: 'successful_redirects_total',
  help: 'Number of successful redirects',
  registers: [register],
});

const failedLookupsTotal = new promClient.Counter({
  name: 'failed_lookups_total',
  help: 'Number of failed lookups (404 errors)',
  registers: [register],
});

// Custom histogram for request latency
const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['operation', 'code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  registers: [register],
});

// --- Database Configuration (Hybrid: Files or Env Vars) ---
let DB_USER, DB_PASSWORD, DB_NAME;
try {
  // Try file-based secrets (Docker Compose style)
  if (process.env.DATABASE_USER_FILE) {
    DB_USER = fs.readFileSync(process.env.DATABASE_USER_FILE, "utf8").trim();
  }
  if (process.env.DATABASE_PASSWORD_FILE) {
    DB_PASSWORD = fs.readFileSync(process.env.DATABASE_PASSWORD_FILE, "utf8").trim();
  }
  if (process.env.DATABASE_NAME_FILE) {
    DB_NAME = fs.readFileSync(process.env.DATABASE_NAME_FILE, "utf8").trim();
  }
} catch (err) {
  console.warn("File-based secrets not found or failed to read. Falling back to direct env vars.");
}

// Fallback to direct env vars (Kubernetes style)
DB_USER = DB_USER || process.env.PGUSER;
DB_PASSWORD = DB_PASSWORD || process.env.POSTGRES_PASSWORD;
DB_NAME = DB_NAME || process.env.PGDATABASE;

// Validate required creds
if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Missing required DB credentials (check env vars or secret files).");
}

const pool = new Pool({
  user: DB_USER,
  host: process.env.PGHOST || process.env.DATABASE_HOST || 'postgres',
  database: DB_NAME,
  password: DB_PASSWORD,
  port: process.env.PGPORT || process.env.DATABASE_PORT || 5432,
  connectionTimeoutMillis: 5000,
});

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Initialization with Retry Logic ---
async function initDb(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to DB and create table... (Attempt ${i + 1})`);
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS urls (
          short_code VARCHAR(32) PRIMARY KEY,
          long_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `;
      // Check for connection success before attempting table creation
      await pool.query('SELECT 1'); 
      await pool.query(createTableSql);
      console.log("Database initialized successfully and table created.");
      return; // Success, exit loop
    } catch (err) {
      if (i === retries - 1) {
        console.error("FATAL: Failed to initialize DB after all retries:", err);
        throw err;
      }
      console.warn(`DB connection or table creation failed. Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Start DB initialization and then start the server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on ${BASE_URL}`);
    });
}).catch((err) => {
  console.error("Application shutting down due to DB failure.");
  process.exit(1);
});

// ---------------------------------------------
// --- Application Routes ---
// ---------------------------------------------

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// shorten (instrumented with metrics)
app.post("/api/shorten", async (req, res) => {
  const endTimer = requestDuration.startTimer({ operation: 'shorten' });
  const { longUrl } = req.body;
  if (!longUrl) {
    res.status(400).json({ error: "Missing longUrl" });
    endTimer({ code: res.statusCode });
    return;
  }

  try {
    // 1. Check if URL already exists (prevents duplicate entries and constraint errors)
    const existing = await pool.query(
      `SELECT short_code FROM urls WHERE long_url = $1 LIMIT 1`,
      [longUrl]
    );

    if (existing.rowCount > 0) {
      const shortCode = existing.rows[0].short_code;
      shortenedUrlsTotal.inc();  // Count as success (existing is still a successful shorten)
      res.json({ shortUrl: `${BASE_URL}/s/${shortCode}`, message: "URL already shortened" });
    } else {
      // 2. Insert new URL
      const shortCode = nanoid(6);
      await pool.query(
        `INSERT INTO urls (short_code, long_url) VALUES ($1, $2)`,
        [shortCode, longUrl]
      );
      shortenedUrlsTotal.inc();  // Count new insertion as success
      res.json({ shortUrl: `${BASE_URL}/s/${shortCode}` });
    }
  } catch (err) {
    console.error("DB operation error (shorten):", err);
    res.status(500).json({ error: "Database error during URL shortening." });
  } finally {
    endTimer({ code: res.statusCode });
  }
});

// redirect (instrumented with metrics)
app.get("/s/:shortCode", async (req, res) => {
  const endTimer = requestDuration.startTimer({ operation: 'redirect' });
  const { shortCode } = req.params;
  try {
    const result = await pool.query(
      `SELECT long_url FROM urls WHERE short_code = $1 LIMIT 1`,
      [shortCode]
    );
    if (result.rowCount === 0) {
      failedLookupsTotal.inc();
      res.status(404).send("Short URL not found");
    } else {
      successfulRedirectsTotal.inc();
      const longUrl = result.rows[0].long_url;
      // Essential: Ensure the URL has a protocol for redirection
      const redirectUrl = longUrl.startsWith('http') ? longUrl : `http://${longUrl}`;
      res.redirect(301, redirectUrl);
    }
  } catch (err) {
    console.error("DB select error (redirect):", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    endTimer({ code: res.statusCode });
  }
});

// Metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Serve frontend build (if you have build in ../frontend/build)
const frontendPath = path.resolve(__dirname, "../frontend/build");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
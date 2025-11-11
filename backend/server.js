// backend/server.js
import express from "express";
import { Pool } from "pg";
import { nanoid } from "nanoid";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
// Remove dotenv if not needed elsewhere

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:3000`;  // Override via env in both setups

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

// shorten
app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "Missing longUrl" });

  try {
    // 1. Check if URL already exists (prevents duplicate entries and constraint errors)
    const existing = await pool.query(
      `SELECT short_code FROM urls WHERE long_url = $1 LIMIT 1`,
      [longUrl]
    );

    if (existing.rowCount > 0) {
      const shortCode = existing.rows[0].short_code;
      return res.json({ shortUrl: `${BASE_URL}/s/${shortCode}`, message: "URL already shortened" });
    }

    // 2. Insert new URL
    const shortCode = nanoid(6);
    await pool.query(
      `INSERT INTO urls (short_code, long_url) VALUES ($1, $2)`,
      [shortCode, longUrl]
    );
    
    res.json({ shortUrl: `${BASE_URL}/s/${shortCode}` });
  } catch (err) {
    console.error("DB operation error (shorten):", err);
    res.status(500).json({ error: "Database error during URL shortening." });
  }
});

// redirect
app.get("/s/:shortCode", async (req, res) => {
  const { shortCode } = req.params;
  try {
    const result = await pool.query(
      `SELECT long_url FROM urls WHERE short_code = $1 LIMIT 1`,
      [shortCode]
    );
    if (result.rowCount === 0) return res.status(404).send("Short URL not found");
    
    const longUrl = result.rows[0].long_url;
    // Essential: Ensure the URL has a protocol for redirection
    const redirectUrl = longUrl.startsWith('http') ? longUrl : `http://${longUrl}`;
    
    return res.redirect(301, redirectUrl);
  } catch (err) {
    console.error("DB select error (redirect):", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Serve frontend build (if you have build in ../frontend/build)
const frontendPath = path.resolve(__dirname, "../frontend/build");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
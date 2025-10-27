// backend/server.js
import express from "express";
import { Pool } from "pg";
import { nanoid } from "nanoid";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:password@postgres:5432/url_shortener";

const pool = new Pool({
  connectionString: DATABASE_URL,
  // optionally add ssl, idleTimeoutMillis, etc for production
});

const app = express();
app.use(cors());
app.use(express.json());

// create table if it doesn't exist
async function initDb() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS urls (
      short_code VARCHAR(32) PRIMARY KEY,
      long_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `;
  await pool.query(createTableSql);
}

initDb().catch((err) => {
  console.error("Failed to initialize DB:", err);
  process.exit(1);
});

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// shorten
app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "Missing longUrl" });

  const shortCode = nanoid(6);
  try {
    await pool.query(
      `INSERT INTO urls (short_code, long_url) VALUES ($1, $2)`,
      [shortCode, longUrl]
    );
    res.json({ shortUrl: `${BASE_URL}/s/${shortCode}` });
  } catch (err) {
    console.error("DB insert error:", err);
    // conflict (unlikely) -> try again or return error
    res.status(500).json({ error: "Database error" });
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
    return res.redirect(longUrl);
  } catch (err) {
    console.error("DB select error:", err);
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

app.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
});

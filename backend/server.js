import express from "express";
import sqlite3pkg from "sqlite3";
import { nanoid } from "nanoid";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "redis";

const sqlite3 = sqlite3pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Redis client
const redisClient = createClient({ url: "redis://redis:6379" });
redisClient.on("error", (err) => console.error("Redis error:", err));
await redisClient.connect();

app.use(cors());
app.use(express.json());

// SQLite setup
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, "urls.db");
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    short_code TEXT PRIMARY KEY,
    long_url TEXT
  )
`);

// Shorten URL
app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "Missing longUrl" });

  const shortCode = nanoid(6);

  db.run("INSERT INTO urls (short_code, long_url) VALUES (?, ?)", [shortCode, longUrl], async (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    // Store in Redis
    await redisClient.set(shortCode, longUrl);
    res.json({ shortUrl: `${BASE_URL}/s/${shortCode}` });
  });
});

// Redirect endpoint with caching
app.get("/s/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  // 1️⃣ Check Redis cache first
  const cachedUrl = await redisClient.get(shortCode);
  if (cachedUrl) {
    console.log("Cache hit:", shortCode);
    return res.redirect(cachedUrl);
  }

  // 2️⃣ If not cached, check SQLite
  db.get("SELECT long_url FROM urls WHERE short_code = ?", [shortCode], async (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Short URL not found" });

    // Store in Redis for next time
    await redisClient.set(shortCode, row.long_url);
    res.redirect(row.long_url);
  });
});

// Serve frontend build
const frontendPath = path.resolve(__dirname, "../frontend/build");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => console.log(` Server running on ${BASE_URL}`));

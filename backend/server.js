import express from "express";
import sqlite3pkg from "sqlite3";
import { nanoid } from "nanoid";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const sqlite3 = sqlite3pkg.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// Ensure data folder exists
const dataFolder = path.join(__dirname, "data");
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

// Initialize SQLite database
const dbPath = path.join(dataFolder, "urls.db");
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    short_code TEXT PRIMARY KEY,
    long_url TEXT
  )
`);

// API endpoint
app.post("/api/shorten", (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "Missing longUrl" });

  const shortCode = nanoid(6);
  db.run(
    "INSERT INTO urls (short_code, long_url) VALUES (?, ?)",
    [shortCode, longUrl],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ shortUrl: `${BASE_URL}/s/${shortCode}` });
    }
  );
});

app.get("/s/:shortCode", (req, res) => {
  const { shortCode } = req.params;
  db.get("SELECT long_url FROM urls WHERE short_code = ?", [shortCode], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Short URL not found" });
    res.redirect(row.long_url);
  });
});

// Serve frontend build
const frontendPath = path.resolve(__dirname, "../frontend/build");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on ${BASE_URL}`));

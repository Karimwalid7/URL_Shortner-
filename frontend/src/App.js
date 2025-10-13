import React, { useState } from "react";
import axios from "axios";

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/shorten", { longUrl });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      alert("Error creating short URL");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔗 URL Shortener</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="url"
          placeholder="Enter your long URL..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Shorten
        </button>
      </form>

      {shortUrl && (
        <div style={styles.result}>
          <p style={styles.resultText}>Your Short URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "linear-gradient(to right, #667eea, #764ba2)",
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "0 20px",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "2rem",
    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
  },
  form: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  input: {
    width: "300px",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem",
  },
  button: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ff6b6b",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
  },
  result: {
    marginTop: "2rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "15px 20px",
    borderRadius: "10px",
    display: "inline-block",
  },
  resultText: {
    marginBottom: "5px",
    fontWeight: "bold",
  },
  link: {
    color: "#fff",
    textDecoration: "underline",
    wordBreak: "break-all",
  },
};

export default App;

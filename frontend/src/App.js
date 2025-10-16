import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/shorten", { longUrl });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      alert("Error creating short URL");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert("Short URL copied to clipboard!");
  };

  return (
    <div className="app">
      <div className="header">
        <div className="icon">🔗</div>
        <h1>URL Shortener</h1>
        <p>Transform long URLs into short, shareable links instantly</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="url-input">Enter your long URL</label>
          <div className="input-group">
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Shortening..." : "Shorten URL"}
            </button>
          </div>
        </form>

        {shortUrl && (
          <div className="result">
            <p>Your shortened URL:</p>
            <div className="result-link">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl}
              </a>
              <button onClick={handleCopy}>Copy</button>
            </div>
          </div>
        )}
      </div>

      <footer>Fast, simple, and secure URL shortening</footer>
    </div>
  );
}

export default App;

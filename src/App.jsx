import { useEffect, useState } from "react";
import "./styles.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Ambil tema dari storage atau default ke dark
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Simpan tema ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // VALIDASI LINK TIKTOK
  const isValidTikTok = (link) => {
    const regex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/.+$/;
    return regex.test(link);
  };

  // AUTO PASTE DETECTION
  useEffect(() => {
    const getClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (isValidTikTok(text)) {
          setUrl(text);
        }
      } catch (err) {
        // Abaikan jika permission ditolak
      }
    };
    getClipboard();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!isValidTikTok(url)) {
      setError("Link bukan URL TikTok yang valid.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (!data.status) throw new Error();
      setResult(data.data);
    } catch {
      setError("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`wrapper ${theme}`}>
      {/* TEMA TOGGLE */}
      <div className="theme-toggle">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <section className="hero">
        <div className="hero-card">
          <h1 className="title">TikTok Downloader</h1>
          <p className="subtitle">Download video tanpa watermark dengan cepat</p>

          <form onSubmit={handleSubmit} className="download-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Paste link TikTok di sini..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">
                Convert
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="result-section">
        {/* LOADING SKELETON */}
        {loading && (
          <div className="result-card skeleton">
            <div className="skeleton-video"></div>
            <div className="skeleton-stats"></div>
            <div className="skeleton-stats" style={{ width: "60%" }}></div>
          </div>
        )}

        {/* HASIL DOWNLOAD */}
        {result && !loading && (
  <div className="result-card success">
    
    {/* BAGIAN 1: MEDIA (GAMBAR ATAU VIDEO) */}
    {result.type === 3 ? (
      <div className="slides-container">
        <div className="image-grid">
          {Object.keys(result.slides)
            .filter((key) => !isNaN(key))
            .map((key) => (
              <div key={key} className="image-card">
                <img src={result.slides[key].url} alt={`Slide ${key}`} />
                <a href={result.slides[key].url} target="_blank" rel="noreferrer">
                  <button className="btn-mini-download">Save Photo</button>
                </a>
              </div>
            ))}
        </div>
      </div>
    ) : (
      <div className="video-container">
        <video 
          key={result.no_watermark_link} 
          className="video-preview" 
          controls 
          src={result.no_watermark_link} 
        />
      </div>
    )}

    {/* BAGIAN 2: CAPTION / TEXT (TEPAT DI BAWAH MEDIA) */}
    {result.text && <p className="description">{result.text}</p>}

    {/* BAGIAN 3: STATISTIK */}
    <div className="stats">
      <div className="stat">❤️ {result.like_count}</div>
      <div className="stat">💬 {result.comment_count}</div>
      <div className="stat">🔁 {result.share_count}</div>
    </div>

    {/* BAGIAN 4: TOMBOL AKSI (DINAMIS) */}
    <div className="button-group">
      {/* Tombol Video HD HANYA muncul jika BUKAN tipe 3 (Gambar) */}
      {result.type !== 3 && result.no_watermark_link_hd && (
        <a href={result.no_watermark_link_hd} target="_blank" rel="noreferrer">
          <button className="btn-download video">Download Video HD</button>
        </a>
      )}

      {/* Tombol Musik muncul untuk Video maupun Gambar */}
      {result.music_link && (
        <a href={result.music_link} target="_blank" rel="noreferrer">
          <button className="btn-download music">Download Music</button>
        </a>
      )}
    </div>
  </div>
)}

        {error && (
          <div className="result-card error">
            <p style={{ color: "#ff4d4d" }}>{error}</p>
          </div>
        )}
      </section>
      
      <footer className="footer">
        <p className="creator-text">Creator: apx.co</p>
      </footer>
    </main>
  );
}

export default App;

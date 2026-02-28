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
    
    {/* LOGIKA MEDIA UTAMA */}
    {result.type === 3 ? (
      /* JIKA PHOTO MODE (TYPE 3) */
      (() => {
        const slideKeys = Object.keys(result.slides).filter(key => !isNaN(key));
        
        if (slideKeys.length === 1) {
          // JIKA HANYA 1 FOTO: Tampilkan besar seperti video
          return (
            <div className="video-container">
              <img 
                src={result.slides["0"].url} 
                className="video-preview" 
                alt="TikTok Photo" 
              />
            </div>
          );
        } else {
          // JIKA LEBIH DARI 1 FOTO: Tampilkan Grid
          return (
            <div className="image-grid">
              {slideKeys.map((key) => (
                <div key={key} className="image-card">
                  <img src={result.slides[key].url} alt={`Slide ${key}`} />
                  <a href={result.slides[key].url} target="_blank" rel="noreferrer">
                    <button className="btn-mini-download">Save Photo</button>
                  </a>
                </div>
              ))}
            </div>
          );
        }
      })()
    ) : (
      /* JIKA VIDEO MODE */
      <div className="video-container">
        <video 
          key={result.no_watermark_link} 
          className="video-preview" 
          controls 
          preload="metadata"
          src={result.no_watermark_link} 
        />
      </div>
    )}

    {/* TEXT CAPTION */}
    {result.text && <p className="description">{result.text}</p>}

    {/* STATS */}
    <div className="stats">
      <div className="stat"><span>❤️</span> {result.like_count}</div>
      <div className="stat"><span>💬</span> {result.comment_count}</div>
      <div className="stat"><span>🔁</span> {result.share_count}</div>
    </div>

    {/* TOMBOL DOWNLOAD UTAMA */}
    <div className="button-group">
  {/* TOMBOL 1: DOWNLOAD VIDEO ATAU PHOTO (Hanya muncul jika bukan grid foto) */}
  {result.type !== 3 || (result.type === 3 && Object.keys(result.slides).filter(k => !isNaN(k)).length === 1) ? (
    <a href={result.type === 3 ? result.slides["0"].url : result.no_watermark_link_hd} target="_blank" rel="noreferrer">
      <button className="btn-download video">
        {result.type === 3 ? "📸 Photo" : "📹 Video"}
      </button>
    </a>
  ) : null}

  {/* TOMBOL 2: DOWNLOAD MUSIC (Selalu muncul) */}
  {result.music_link && (
    <a href={result.music_link} target="_blank" rel="noreferrer">
      <button className="btn-download music">
        🎵 Music
      </button>
    </a>
  )}
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

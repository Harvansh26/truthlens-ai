import { useState } from "react";
import jsPDF from "jspdf";

function App() {
  const [page, setPage] = useState("dashboard");
  const [mode, setMode] = useState("text");

  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState(null);

  const [url, setUrl] = useState("");
  const [urlResult, setUrlResult] = useState(null);

  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [mediaResult, setMediaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);

  const analyzeText = () => {
    if (!text.trim()) return alert("Paste some text first");

    const riskyWords = ["pay", "upi", "urgent", "fee", "shortlisted", "deposit", "limited", "offer"];
    const hits = riskyWords.filter((word) => text.toLowerCase().includes(word));
    const riskScore = Math.min(95, 25 + hits.length * 15);

    const result = {
      type: "Text Verification",
      authenticityScore: 100 - riskScore,
      riskLevel: riskScore > 60 ? "High" : riskScore > 35 ? "Medium" : "Low",
      findings: hits.length
        ? hits.map((w) => `Suspicious keyword detected: ${w}`)
        : ["No major scam keywords detected"],
      recommendation:
        riskScore > 60
          ? "This content looks suspicious. Verify sender/source before trusting."
          : "Content looks relatively safe, but still verify the source.",
    };

    setTextResult(result);
    setHistory((prev) => [{ mode: "TEXT", result, date: new Date().toLocaleString() }, ...prev]);
  };

  const analyzeURL = () => {
    if (!url.trim()) return alert("Enter URL first");

    const lowerUrl = url.toLowerCase();
    let risk = 20;
    const findings = [];

    if (lowerUrl.includes("http://")) {
      risk += 25;
      findings.push("URL uses non-secure HTTP protocol");
    } else {
      findings.push("HTTPS/security protocol checked");
    }

    if (lowerUrl.includes("free") || lowerUrl.includes("win") || lowerUrl.includes("offer")) {
      risk += 20;
      findings.push("Promotional/scam-like keyword detected");
    }

    if (lowerUrl.includes("bit.ly") || lowerUrl.includes("tinyurl") || lowerUrl.includes("shorturl")) {
      risk += 20;
      findings.push("Shortened URL detected");
    }

    if (url.length > 70) {
      risk += 10;
      findings.push("Unusually long URL structure detected");
    }

    if (!findings.length) {
      findings.push("No major suspicious URL pattern detected");
    }

    risk = Math.min(95, risk);

    const result = {
      type: "URL Verification",
      authenticityScore: 100 - risk,
      riskLevel: risk > 60 ? "High" : risk > 35 ? "Medium" : "Low",
      findings,
      recommendation:
        risk > 60
          ? "This link looks suspicious. Avoid opening it until verified."
          : risk > 35
          ? "This link has some risk signals. Open only if the source is trusted."
          : "This link looks relatively safe, but still verify the source.",
    };

    setUrlResult(result);
    setHistory((prev) => [{ mode: "URL", result, date: new Date().toLocaleString() }, ...prev]);
  };

  const analyzeMedia = async () => {
    if (!file) return alert("Upload a file first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType);

    setLoading(true);
    setMediaResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/media/analyze-media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Media analysis failed");

      const result = data.result || data;
      setMediaResult(result);
      setHistory((prev) => [
        { mode: `${mediaType.toUpperCase()} MEDIA`, result, date: new Date().toLocaleString() },
        ...prev,
      ]);
    } catch (err) {
      alert("Backend or AI service is not running");
    } finally {
      setLoading(false);
    }
  };

  const result =
    mode === "text" ? textResult :
    mode === "media" ? mediaResult :
    urlResult;

  const riskColor =
    result?.riskLevel === "High"
      ? "#ef4444"
      : result?.riskLevel === "Medium"
      ? "#f59e0b"
      : "#22c55e";

  const downloadPDF = () => {
    if (!result) return alert("No report available");

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("TruthLens AI Analysis Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Type: ${result.type}`, 20, 40);
    doc.text(`Authenticity Score: ${result.authenticityScore}%`, 20, 50);
    doc.text(`Risk Level: ${result.riskLevel}`, 20, 60);

    doc.text("Findings:", 20, 80);
    result.findings?.forEach((item, index) => {
      doc.text(`- ${item}`, 25, 92 + index * 10);
    });

    doc.text("Recommendation:", 20, 130);
    doc.text(result.recommendation, 20, 140, { maxWidth: 170 });

    doc.save("truthlens-report.pdf");
  };

  return (
    <div style={styles.page}>
      <Header setPage={setPage} page={page} />

      {page === "history" && (
        <main style={styles.container}>
          <section style={styles.singleCard}>
            <div style={styles.pageTitleRow}>
              <div>
                <h2 style={styles.title}>Analysis History</h2>
                <p style={styles.desc}>Track all your recent text, URL, and media verification checks.</p>
              </div>
              <button onClick={() => setPage("dashboard")} style={styles.buttonSmall}>
                New Analysis
              </button>
            </div>

            {history.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🕘</div>
                <h2>No history yet</h2>
                <p>Your completed analysis reports will appear here.</p>
              </div>
            ) : (
              <div style={styles.historyGrid}>
                {history.map((item, index) => (
                  <div key={index} style={styles.historyCard}>
                    <div style={styles.historyTop}>
                      <span style={styles.historyBadge}>{item.mode}</span>
                      <span style={styles.historyDate}>{item.date}</span>
                    </div>

                    <h3 style={styles.historyTitle}>{item.result.type}</h3>

                    <div style={styles.historyScoreRow}>
                      <div>
                        <p style={styles.muted}>Authenticity</p>
                        <h2 style={styles.historyScore}>{item.result.authenticityScore}%</h2>
                      </div>
                      <div style={styles.riskPill}>{item.result.riskLevel}</div>
                    </div>

                    <p style={styles.historyText}>{item.result.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {page === "profile" && (
        <main style={styles.container}>
          <section style={styles.singleCard}>
            <div style={styles.profileHero}>
              <div style={styles.profileAvatar}>V</div>
              <div>
                <h2 style={styles.profileName}>Harvansh</h2>
                <p style={styles.profileRole}>TruthLens AI User</p>
              </div>
            </div>

            <div style={styles.profileStats}>
              <div style={styles.statCard}>
                <span>Total Checks</span>
                <b>{history.length}</b>
              </div>
              <div style={styles.statCard}>
                <span>Project Type</span>
                <b>Multimodal AI</b>
              </div>
              <div style={styles.statCard}>
                <span>Status</span>
                <b>Active</b>
              </div>
            </div>

            <div style={styles.profileDetailsGrid}>
              <div style={styles.detailCard}>
                <h3>Project Overview</h3>
                <p>AI-powered scam and authenticity verification system for text, URLs, images, videos, and audio.</p>
              </div>

              <div style={styles.detailCard}>
                <h3>Enabled Features</h3>
                <p>Text Verification • URL Scanner • Image Analysis • Video Check • Audio Voice Check • PDF Reports</p>
              </div>

              <div style={styles.detailCard}>
                <h3>Role</h3>
                <p>Developer / Project Owner</p>
              </div>

              <div style={styles.detailCard}>
                <h3>Architecture</h3>
                <p>Frontend + Backend + AI Service based modular architecture.</p>
              </div>
            </div>
          </section>
        </main>
      )}

      {page === "dashboard" && (
        <main style={styles.container}>
          <section style={styles.tabs}>
            <button onClick={() => setMode("text")} style={mode === "text" ? styles.activeTab : styles.tab}>
              Text Verification
            </button>
            <button onClick={() => setMode("media")} style={mode === "media" ? styles.activeTab : styles.tab}>
              Media Verification
            </button>
            <button onClick={() => setMode("url")} style={mode === "url" ? styles.activeTab : styles.tab}>
              URL Scanner
            </button>
          </section>

          <section style={styles.grid}>
            <div style={styles.card}>
              {mode === "text" ? (
                <>
                  <div style={styles.cardHead}>
                    <div style={styles.icon}>🔍</div>
                    <div>
                      <h2 style={styles.title}>Analyze Text</h2>
                      <p style={styles.desc}>Paste suspicious job posts, emails, messages, or URLs.</p>
                    </div>
                  </div>

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste suspicious content here..."
                    style={styles.textarea}
                  />

                  <button onClick={analyzeText} style={styles.button}>Analyze Text</button>
                </>
              ) : mode === "media" ? (
                <>
                  <div style={styles.cardHead}>
                    <div style={styles.icon}>🧠</div>
                    <div>
                      <h2 style={styles.title}>Analyze Media</h2>
                      <p style={styles.desc}>Upload image, video, or audio files for authenticity risk.</p>
                    </div>
                  </div>

                  <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} style={styles.input}>
                    <option value="image">Image Verification</option>
                    <option value="video">Video Deepfake Check</option>
                    <option value="audio">Audio Voice Check</option>
                  </select>

                  <label style={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                    <div style={styles.uploadIcon}>📁</div>
                    <p style={styles.fileName}>{file ? file.name : "Click to upload file"}</p>
                    <small style={styles.small}>Supports image, video and audio files</small>
                  </label>

                  <button onClick={analyzeMedia} style={styles.button}>
                    {loading ? "Analyzing..." : "Analyze Media"}
                  </button>
                </>
              ) : (
                <>
                  <div style={styles.cardHead}>
                    <div style={styles.icon}>🌐</div>
                    <div>
                      <h2 style={styles.title}>Analyze URL</h2>
                      <p style={styles.desc}>Check suspicious links, phishing URLs, and risky domains.</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste website URL here..."
                    style={styles.input}
                  />

                  <div style={styles.urlHintBox}>
                    <p>Checks for HTTP, shortened links, long URLs, and scam-like keywords.</p>
                  </div>

                  <button onClick={analyzeURL} style={styles.button}>Scan URL</button>
                </>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.resultHeader}>
                <h2 style={styles.title}>📊 Result</h2>
                <span style={styles.status}>{result ? "Analysis ready" : "Waiting"}</span>
              </div>

              {!result ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>🧬</div>
                  <h2>No analysis yet</h2>
                  <p>Choose text, media, or URL and click analyze to generate the report.</p>
                </div>
              ) : (
                <div
                  style={{
                    ...styles.resultBox,
                    borderTop: `6px solid ${riskColor}`,
                  }}
                >
                  <h2 style={styles.resultTitle}>{result.type}</h2>

                  <div style={styles.circle}>
                    <span>{result.authenticityScore}%</span>
                  </div>

                  <div
                    style={{
                      ...styles.riskRow,
                      border: `1px solid ${riskColor}`,
                    }}
                  >
                    <span>Risk Level</span>
                    <b style={{ color: riskColor }}>{result.riskLevel}</b>
                  </div>

                  <h3>Findings</h3>
                  <ul style={styles.list}>
                    {result.findings?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <p style={styles.recommendation}>{result.recommendation}</p>

                  <button onClick={downloadPDF} style={styles.buttonSmall}>
                    Download PDF Report
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function Header({ setPage, page }) {
  return (
    <header style={styles.navbar}>
      <div style={styles.brandBox}>
        <div style={styles.logoBox}>✓</div>
        <div>
          <h1 style={styles.logo}>TruthLens AI</h1>
          <p style={styles.sub}>Multimodal scam and authenticity verification</p>
        </div>
      </div>

      <div style={styles.navRight}>
        <button onClick={() => setPage("dashboard")} style={page === "dashboard" ? styles.navButtonActive : styles.navButton}>Dashboard</button>
        <button onClick={() => setPage("history")} style={page === "history" ? styles.navButtonActive : styles.navButton}>History</button>
        <button onClick={() => setPage("profile")} style={styles.profileBtn}>V</button>
      </div>
    </header>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1020, #111827, #24124d)",
    color: "white",
    fontFamily: "Inter, Arial, sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  navbar: {
    maxWidth: "1400px",
    margin: "0 auto 24px",
    background: "rgba(15, 23, 42, 0.94)",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    borderRadius: "22px",
    padding: "22px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBox: { display: "flex", alignItems: "center", gap: "16px" },
  logoBox: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #6d28d9, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
  },
  logo: { margin: 0, fontSize: "34px" },
  sub: { margin: "6px 0 0", color: "#a5b4fc", fontSize: "15px" },
  navRight: { display: "flex", alignItems: "center", gap: "18px" },
  navButton: {
    background: "transparent",
    border: "none",
    color: "#c4b5fd",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
  },
  navButtonActive: {
    background: "rgba(124, 58, 237, 0.2)",
    border: "1px solid rgba(167,139,250,0.5)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "16px",
    cursor: "pointer",
  },
  profileBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #6d28d9, #9333ea)",
    color: "white",
    fontWeight: "900",
    fontSize: "18px",
    cursor: "pointer",
  },
  container: { maxWidth: "1400px", margin: "0 auto" },
  tabs: { display: "flex", gap: "14px", marginBottom: "22px", flexWrap: "wrap" },
  tab: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "1px solid #6366f1",
    background: "rgba(15, 23, 42, 0.85)",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
  },
  activeTab: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #9333ea)",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "800",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  card: {
    minHeight: "560px",
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    borderRadius: "26px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    boxSizing: "border-box",
  },
  singleCard: {
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    borderRadius: "26px",
    padding: "34px",
    minHeight: "560px",
  },
  cardHead: { display: "flex", gap: "18px", alignItems: "center", marginBottom: "24px" },
  icon: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  title: { fontSize: "30px", margin: 0 },
  desc: { color: "#c7d2fe", fontSize: "16px", lineHeight: 1.5, margin: "8px 0 0" },
  textarea: {
    width: "100%",
    minHeight: "285px",
    padding: "18px",
    borderRadius: "18px",
    background: "#1e293b",
    color: "white",
    border: "1px solid #6366f1",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    background: "#1e293b",
    color: "white",
    border: "1px solid #6366f1",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  urlHintBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(49, 46, 129, 0.55)",
    color: "#c7d2fe",
    lineHeight: 1.5,
  },
  uploadBox: {
    marginTop: "22px",
    border: "2px dashed #7c3aed",
    borderRadius: "22px",
    padding: "44px 24px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(30, 41, 59, 0.72)",
    display: "block",
  },
  uploadIcon: { fontSize: "44px", marginBottom: "12px" },
  fileName: { fontSize: "17px", fontWeight: "700", margin: "8px 0 4px" },
  small: { color: "#c7d2fe" },
  button: {
    marginTop: "24px",
    width: "100%",
    padding: "17px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #9333ea)",
    color: "white",
    fontSize: "18px",
    fontWeight: "800",
    cursor: "pointer",
  },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  status: {
    background: "#312e81",
    color: "#ddd6fe",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "700",
  },
  empty: {
    minHeight: "430px",
    border: "1px dashed #7c3aed",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#c7d2fe",
  },
  emptyIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    marginBottom: "14px",
  },
  resultBox: {
    background: "rgba(30, 41, 59, 0.9)",
    borderRadius: "24px",
    padding: "28px",
  },
  resultTitle: { fontSize: "28px", margin: 0, textAlign: "center" },
  circle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "900",
    margin: "24px auto",
    color: "white",
    boxShadow: "0 0 35px rgba(168, 85, 247, 0.45)",
    border: "10px solid rgba(255,255,255,0.08)",
  },
  riskRow: {
    display: "flex",
    justifyContent: "space-between",
    background: "#111827",
    padding: "14px 16px",
    borderRadius: "14px",
    marginBottom: "18px",
  },
  list: { lineHeight: 1.7, paddingLeft: "22px" },
  recommendation: {
    marginTop: "22px",
    padding: "16px",
    background: "#312e81",
    borderRadius: "14px",
    lineHeight: 1.5,
  },
  pageTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  buttonSmall: {
    marginTop: "18px",
    padding: "12px 18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #9333ea)",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
  },

  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "22px",
    marginTop: "28px",
  },
  historyCard: {
    background: "linear-gradient(135deg, rgba(30,41,59,0.98), rgba(49,46,129,0.55))",
    border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: "26px",
    padding: "26px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
  },
  historyTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },
  historyBadge: {
    background: "linear-gradient(135deg, #6366f1, #9333ea)",
    color: "white",
    padding: "9px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },
  historyDate: {
    color: "#c4b5fd",
    fontSize: "14px",
  },
  historyTitle: {
    fontSize: "26px",
    margin: "0 0 20px",
  },
  historyScoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(15,23,42,0.85)",
    border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "18px",
  },
  muted: {
    color: "#c7d2fe",
    margin: "0 0 8px",
    fontSize: "15px",
  },
  historyScore: {
    margin: 0,
    color: "#a78bfa",
    fontSize: "44px",
    fontWeight: "900",
  },
  riskPill: {
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    padding: "13px 20px",
    borderRadius: "999px",
    fontWeight: "900",
    boxShadow: "0 0 24px rgba(168,85,247,0.35)",
  },
  historyText: {
    color: "#e0e7ff",
    lineHeight: 1.6,
    fontSize: "16px",
    background: "rgba(15,23,42,0.45)",
    padding: "14px 16px",
    borderRadius: "16px",
  },

  profileHero: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(147,51,234,0.25))",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    borderRadius: "26px",
    padding: "34px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "24px",
  },
  profileAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6d28d9, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "900",
  },
  profileName: { fontSize: "38px", margin: 0 },
  profileRole: { margin: "8px 0 0", color: "#c7d2fe", fontSize: "18px" },
  profileStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#1e293b",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "20px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  profileDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
  },
  detailCard: {
    background: "#1e293b",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "20px",
    padding: "22px",
  },
};

export default App;
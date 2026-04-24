import { useState } from "react";
import { Link } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import api from "../services/api";

const Dashboard = () => {
  const [text, setText] = useState("");
  const [contentType, setContentType] = useState("job_post");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const userName = localStorage.getItem("user") || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const suspiciousWords = ["pay", "fee", "urgent", "upi", "verify", "limited", "deposit", "shortlisted"];

  const sampleButtons = [
    { label: "Scam Job", type: "scam" },
    { label: "Safe Email", type: "safe" },
  ];

  const loadSample = (type) => {
    if (type === "scam") {
      setText("URGENT! You are shortlisted. Pay ₹2000 UPI deposit to confirm your job.");
      setContentType("job_post");
    } else {
      setText("Your interview is scheduled tomorrow at 10 AM. No payment is required.");
      setContentType("email");
    }
    setResult(null);
    setError("");
  };

  const clearInput = () => {
    setText("");
    setResult(null);
    setError("");
    toast.success("Input cleared");
  };

  const getRiskColor = () => {
    if (!result) return "#ccc";
    if (result.riskScore > 70) return "#ef4444";
    if (result.riskScore > 40) return "#f59e0b";
    return "#22c55e";
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success("Result copied!");
  };

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("TruthLens AI Report", 10, 15);
    doc.setFontSize(11);
    doc.text(`Content Type: ${contentType}`, 10, 30);
    doc.text(`Risk Score: ${result.riskScore}`, 10, 40);
    doc.text(`Verdict: ${result.verdict}`, 10, 50);
    doc.text(`AI Probability: ${result.aiProbability}`, 10, 60);
    doc.text(`Confidence: ${result.confidence || "N/A"}%`, 10, 70);

    doc.text("Reasons:", 10, 85);
    result.reasons?.forEach((reason, index) => {
      doc.text(`${index + 1}. ${reason}`, 10, 95 + index * 10);
    });

    doc.text("Analyzed Text:", 10, 130);
    doc.text(doc.splitTextToSize(text, 180), 10, 140);
    doc.save("truthlens-ai-report.pdf");
    toast.success("PDF downloaded!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/login";
  };

  const saveToHistory = (report) => {
    const oldHistory = JSON.parse(localStorage.getItem("history")) || [];

    const newReport = {
      text,
      contentType,
      result: report,
      createdAt: new Date().toLocaleString(),
    };

    localStorage.setItem("history", JSON.stringify([newReport, ...oldHistory]));
  };

  const highlightText = (value) => {
    const regex = new RegExp(`(${suspiciousWords.join("|")})`, "gi");

    return value.split(regex).map((part, index) =>
      suspiciousWords.includes(part.toLowerCase()) ? (
        <mark key={index} className="highlight-word">{part}</mark>
      ) : (
        part
      )
    );
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter content first");
      toast.error("Please enter content first");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/analyze", {
        text,
        contentType,
      });

      setResult(res.data);
      saveToHistory(res.data);
      toast.success("Analysis complete!");

      setTimeout(() => {
        document.querySelector(".result-card")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200);
    } catch (err) {
      setError("ML backend error. Make sure Flask is running on port 5000.");
      toast.error("Backend error. Check Flask server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Toaster position="top-right" />

      <div className="dashboard-topbar">
        <div className="brand-area">
          <div className="brand-icon">✓</div>
          <div>
            <h2>TruthLens AI</h2>
            <span>Dashboard</span>
          </div>
        </div>

        <div className="topbar-right">
          <Link to="/history" className="ghost-link">
            History
          </Link>

          <div className="user-menu">
            <div className="avatar" onClick={() => setShowMenu(!showMenu)}>
              {userInitial}
            </div>

            {showMenu && (
              <div className="dropdown">
                <p className="dropdown-name">{userName}</p>
                <Link to="/history">History</Link>
                <button className="dropdown-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="section-heading">
            <div className="section-icon">🔍</div>
            <div>
              <h3>Analyze Content</h3>
              <p>Paste suspicious job posts, emails, or messages to detect scam risk.</p>
            </div>
          </div>

          <div className="sample-toolbar">
            <div>
              <p className="toolbar-label">Quick test samples</p>
              <div className="sample-buttons">
                {sampleButtons.map((sample) => (
                  <button
                    key={sample.type}
                    onClick={() => loadSample(sample.type)}
                    className="sample-chip"
                  >
                    {sample.label}
                  </button>
                ))}
                <button onClick={clearInput} className="sample-chip clear-chip">
                  Clear
                </button>
              </div>
            </div>

            <span className="char-count">{text.length} chars</span>
          </div>

          <div className="analysis-form">
            <select
              className="auth-select"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="job_post">Job Post</option>
              <option value="email">Email</option>
              <option value="message">Message</option>
            </select>

            <textarea
              className="auth-textarea dashboard-textarea"
              placeholder="Paste content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="input-footer">
              <span>Tip: Try pay, UPI, urgent, fee, shortlisted</span>
              <span>{contentType.replace("_", " ").toUpperCase()}</span>
            </div>

            <button className="auth-button analyze-btn" onClick={handleAnalyze} disabled={loading}>
              {loading ? <span className="loader"></span> : "Analyze Content"}
            </button>

            {error && <div className="auth-error">{error}</div>}
          </div>

          {text && (
            <div className="highlight-box">
              <h4>Suspicious Keyword Preview</h4>
              <p>{highlightText(text)}</p>
            </div>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <h3>📊 Result</h3>

          {!result ? (
            <div className="result-empty">
              <div className="result-empty-content">
                <div className="result-empty-icon">
                  {loading ? "⏳" : "🧠"}
                </div>

                <h4>{loading ? "Analyzing content..." : "No analysis yet"}</h4>

                <p>
                  {loading
                    ? "TruthLens AI is checking scam signals, suspicious keywords, and risk patterns."
                    : "Paste content on the left and click Analyze Content to generate a detailed AI risk report."}
                </p>

                {loading && (
                  <div className="ai-thinking">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                {!loading && (
                  <p className="result-hint">
                    Score • Verdict • Reasons • PDF Report
                  </p>
                )}
              </div>
            </div>
          ) : (
            <motion.div
              className="result-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="score-meter">
                <CircularProgressbar
                  value={result.riskScore}
                  text={`${result.riskScore}%`}
                />
              </div>

              <div className={`risk-badge ${result.verdict.toLowerCase().replace(" ", "-")}`}>
                {result.verdict}
              </div>

              <div className="metric">
                <div
                  className="metric-box"
                  style={{ borderLeft: `5px solid ${getRiskColor()}` }}
                >
                  <span>Risk Score</span>
                  <strong>{result.riskScore}</strong>
                </div>

                <div className="metric-box">
                  <span>Verdict</span>
                  <strong>{result.verdict}</strong>
                </div>

                <div className="metric-box">
                  <span>AI Probability</span>
                  <strong>{result.aiProbability}</strong>
                </div>
              </div>

              {result.confidence && (
                <div className="reason-box">
                  <h4>Model Confidence</h4>
                  <p>{result.confidence}%</p>
                </div>
              )}

              <div className="reason-box">
                <h4>Reasons</h4>
                <ul className="reason-list">
                  {result.reasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="action-row">
                <button onClick={copyResult} className="auth-button">
                  Copy Result
                </button>
                <button onClick={downloadPDF} className="auth-button secondary-btn">
                  Download PDF
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
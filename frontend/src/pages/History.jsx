import { useState } from "react";
import { Link } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("history")) || []
  );

  const deleteReport = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  const getBadgeClass = (verdict) => {
    if (!verdict) return "";
    return verdict.toLowerCase().replace(" ", "-");
  };

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div>
            <p className="history-label">TruthLens AI</p>
            <h1>Analysis History</h1>
            <p className="history-subtitle">
              View your previously generated AI risk reports.
            </p>
          </div>

          <div className="history-actions">
            {history.length > 0 && (
              <button className="clear-history-btn" onClick={clearHistory}>
                Clear History
              </button>
            )}

            <Link className="back-btn" to="/dashboard">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="history-empty-card">
            <div className="history-empty-icon">📂</div>
            <h2>No reports found yet</h2>
            <p>
              Once you analyze suspicious content, your saved reports will appear here.
            </p>
            <Link className="auth-button history-action-btn" to="/dashboard">
              Analyze Content
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div className="history-report-card" key={index}>
                <div className="history-card-top">
                  <div>
                    <span className="history-type">
                      {item.contentType?.replace("_", " ").toUpperCase()}
                    </span>
                    <h3>{item.result?.verdict || "Unknown Result"}</h3>
                    <p>{item.createdAt}</p>
                  </div>

                  <div className={`history-badge ${getBadgeClass(item.result?.verdict)}`}>
                    {item.result?.verdict}
                  </div>
                </div>

                <div className="history-metrics">
                  <div>
                    <span>Risk Score</span>
                    <strong>{item.result?.riskScore}%</strong>
                  </div>

                  <div>
                    <span>AI Probability</span>
                    <strong>{item.result?.aiProbability}</strong>
                  </div>

                  <div>
                    <span>Confidence</span>
                    <strong>{item.result?.confidence || "N/A"}%</strong>
                  </div>
                </div>

                <div className="history-text-box">
                  <h4>Analyzed Text</h4>
                  <p>{item.text}</p>
                </div>

                <div className="history-text-box">
                  <h4>Reasons</h4>
                  <ul>
                    {item.result?.reasons?.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <button
                  className="delete-report-btn"
                  onClick={() => deleteReport(index)}
                >
                  Delete Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
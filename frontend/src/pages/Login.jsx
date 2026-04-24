import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter email and password");
      return;
    }

    const userName = formData.email.split("@")[0];

    localStorage.setItem("user", userName);
    localStorage.setItem("isLoggedIn", "true");

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-left">
          <div className="brand-badge">TruthLens AI • Secure Intelligence</div>

          <h1>Detect scams, fake offers, and suspicious content instantly.</h1>

          <p>
            A modern AI-powered risk analysis platform built for real-world
            credibility checks across job posts, emails, and online messages.
          </p>

          <div className="feature-list">
            <div className="feature-item">Real-time scam and phishing detection</div>
            <div className="feature-item">Explainable AI verdicts with risk reasons</div>
            <div className="feature-item">Protected dashboard with saved report history</div>
          </div>
        </div>

        <div className="auth-right">
          <form className="auth-card" onSubmit={handleSubmit}>
            <h2>Welcome back</h2>

            <p className="auth-subtitle">
              Login to continue analyzing suspicious content with TruthLens AI.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-form">
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              <button className="auth-button" type="submit">
                Login to Dashboard
              </button>
            </div>

            <p className="auth-footer">
              Don&apos;t have an account? <Link to="/signup">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
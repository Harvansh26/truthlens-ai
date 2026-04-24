import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signup(formData);
      navigate("/dashboard");
    } catch (err) {
      console.log("Signup error full:", err);
      console.log("Signup error response:", err.response?.data);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Signup failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="brand-badge">TruthLens AI • Industry Ready</div>
          <h1>Build trust with smarter content verification.</h1>
          <p>
            Create your account and access a full-stack AI dashboard that
            analyzes suspicious text, job offers, and risky communication.
          </p>

          <div className="feature-list">
            <div className="feature-item">AI-driven risk scoring engine</div>
            <div className="feature-item">Secure authentication and protected reports</div>
            <div className="feature-item">Resume-grade full-stack product experience</div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <form className="auth-card" onSubmit={handleSubmit}>
            <h2>Create account</h2>
            <p className="auth-subtitle">
              Join TruthLens AI and start verifying suspicious content smarter.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-form">
              <input
                className="auth-input"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />

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
                placeholder="Create a password (min 8 chars)"
                value={formData.password}
                onChange={handleChange}
              />

              <button className="auth-button" type="submit">
                Create Account
              </button>
            </div>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
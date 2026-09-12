import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StudentLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/student/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("residingStatus", response.data.residingStatus);

      navigate("/student/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <div className="login-info">
          <h1>AskNFix</h1>

          <p>
            Raise maintenance queries, track their progress,
            and get problems resolved easily.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <span className="login-feature-icon">✓</span>
              Raise maintenance queries
            </div>

            <div className="login-feature">
              <span className="login-feature-icon">✓</span>
              Track your queries
            </div>

            <div className="login-feature">
              <span className="login-feature-icon">✓</span>
              View completed requests
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Student Login</h2>

            <p className="login-form-subtitle">
              Sign in to manage your maintenance queries
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="login-switch">
              Staff member?
              <button
                type="button"
                className="link-button"
                onClick={() => navigate("/staff/login")}
              >
                Staff Login
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default StudentLogin;
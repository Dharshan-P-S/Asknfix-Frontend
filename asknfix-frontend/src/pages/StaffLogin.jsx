import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StaffLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/staff/login", {
                email,
                password
            });

            const data = response.data;

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("name", data.name);
            localStorage.setItem("email", data.email);

            if (data.role?.toUpperCase() === "ADMIN") {
                navigate("/staff/dashboard");
            } else if (data.role?.toUpperCase() === "WORKER") {
                navigate("/worker/dashboard");
            } else {
                setError("Invalid staff role");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data ||
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
                        Staff maintenance management portal for handling
                        student maintenance requests efficiently.
                    </p>

                    <div className="login-features">
                        <div className="login-feature">
                            <span className="login-feature-icon">✓</span>
                            Manage maintenance queries
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">✓</span>
                            Track assigned requests
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">✓</span>
                            Resolve student issues
                        </div>
                    </div>
                </div>

                <div className="login-form-container">
                    <form className="login-form" onSubmit={handleLogin}>

                        <h2>Staff Login</h2>

                        <p className="login-form-subtitle">
                            Sign in to access the staff portal
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
                                onChange={(event) => setEmail(event.target.value)}
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
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        <div className="login-switch">
                            Student?
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => navigate("/student/login")}
                            >
                                Student Login
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}

export default StaffLogin;
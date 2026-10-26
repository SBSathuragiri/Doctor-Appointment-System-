import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            const role = result.data?.role;

            if (role === "patient") {
                navigate("/patient/dashboard");
            } else if (role === "doctor") {
                navigate("/doctor/dashboard");
            } else if (role === "admin") {
                navigate("/admin/dashboard");
            } else {
                setError(
                    "Login succeeded, but the user role was not recognized."
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="cp-login-page">
            <section className="cp-login-visual">
                <Link to="/" className="cp-brand">
                    <span className="cp-brand-symbol">
                        <svg
                            viewBox="0 0 48 48"
                            width="32"
                            height="32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M24 5L39 11V22C39 32 32 39 24 43C16 39 9 32 9 22V11L24 5Z"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M13 24H19L23 16L28 31L32 24H36"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>

                    <span className="cp-brand-name">
                        CARE <strong>POINT</strong>
                    </span>
                </Link>

                <div className="cp-visual-content">
                    <span className="cp-eyebrow">
                        YOUR HEALTHCARE PARTNER
                    </span>

                    <h1>
                        Better health.
                        <br />
                        <span>Brighter tomorrows.</span>
                    </h1>

                    <p className="cp-visual-description">
                        Your healthcare journey, made simpler.
                        Book appointments, connect with doctors,
                        and keep your care organized in one place.
                    </p>

                    <div className="cp-feature-list">
                        <div className="cp-feature">
                            <span className="cp-feature-icon">♡</span>
                            <div>
                                <h3>Care that connects</h3>
                                <p>Find doctors and book appointments easily.</p>
                            </div>
                        </div>

                        <div className="cp-feature">
                            <span className="cp-feature-icon">✓</span>
                            <div>
                                <h3>Your care, organized</h3>
                                <p>Keep track of appointments and prescriptions.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="cp-visual-footer">
                    CONNECT <span>•</span> CONSULT <span>•</span> CARE
                </p>
            </section>

            <section className="cp-login-form-side">
                <div className="cp-login-card">
                    <Link to="/" className="cp-brand cp-mobile-brand">
                        <span className="cp-brand-symbol">
                            <span>+</span>
                        </span>
                        <span>
                            CARE <strong>POINT</strong>
                        </span>
                    </Link>

                    <div className="cp-form-heading">
                        <span className="cp-eyebrow">
                            WELCOME TO CARE POINT
                        </span>

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to continue your healthcare journey.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="cp-login-form">
                        <div className="cp-field">
                            <label htmlFor="login-email">
                                Email address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="cp-field">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="cp-login-error" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="cp-login-submit"
                            disabled={loading}
                        >
                            <span>
                                {loading ? "Signing in..." : "Sign in"}
                            </span>
                            {!loading && <span aria-hidden="true">→</span>}
                        </button>
                    </form>

                    <div className="cp-login-divider">
                        <span />
                        <span>YOUR CARE STARTS HERE</span>
                        <span />
                    </div>

                    <p className="cp-register-prompt">
                        Don't have an account?{" "}
                        <Link to="/register">Create an account</Link>
                    </p>

                    <p className="cp-doctor-prompt">
                        Are you a doctor?{" "}
                        <Link to="/doctor-register">
                            Join Care Point
                        </Link>
                    </p>

                    <p className="cp-login-footer">
                        Your health matters. Every step of the way.
                    </p>
                </div>
            </section>
        </main>
    );
}

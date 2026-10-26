import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./Register.css";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            setSuccess("Account created successfully! Redirecting to login...");

            window.setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="cp-register-page">
            <section className="cp-register-visual">
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

                <div className="cp-register-visual-content">
                    <span className="cp-register-eyebrow">
                        YOUR HEALTHCARE PARTNER
                    </span>

                    <h1>
                        Take charge
                        <br />
                        of your <span>health.</span>
                    </h1>

                    <p className="cp-register-description">
                        Your journey to better healthcare starts here.
                        Find doctors, book appointments, and keep your
                        healthcare information organized in one place.
                    </p>

                    <div className="cp-register-benefits">
                        <div className="cp-register-benefit">
                            <span className="cp-register-benefit-icon">
                                ♡
                            </span>
                            <div>
                                <h3>Find the right doctor</h3>
                                <p>
                                    Explore doctors based on your needs.
                                </p>
                            </div>
                        </div>

                        <div className="cp-register-benefit">
                            <span className="cp-register-benefit-icon">
                                ✓
                            </span>
                            <div>
                                <h3>Manage your appointments</h3>
                                <p>
                                    Keep your healthcare journey organized.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="cp-register-visual-footer">
                    CONNECT <span>•</span> CONSULT <span>•</span> CARE
                </p>
            </section>

            <section className="cp-register-form-side">
                <div className="cp-register-card">

                    <div className="cp-register-heading">
                        <span className="cp-register-eyebrow">
                            PATIENT REGISTRATION
                        </span>

                        <h2>Create your account</h2>

                        <p>
                            Join Care Point for a simpler healthcare
                            experience.
                        </p>
                    </div>

                    <form
                        className="cp-register-form"
                        onSubmit={handleRegister}
                    >
                        <div className="cp-register-field">
                            <label htmlFor="register-name">
                                Full name
                            </label>

                            <input
                                id="register-name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Enter your full name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="cp-register-field">
                            <label htmlFor="register-email">
                                Email address
                            </label>

                            <input
                                id="register-email"
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

                        <div className="cp-register-field">
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <small>
                                Use at least 8 characters.
                            </small>
                        </div>

                        {error && (
                            <div
                                className="cp-register-alert cp-register-alert-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {success && (
                            <div
                                className="cp-register-alert cp-register-alert-success"
                                role="status"
                            >
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="cp-register-submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </span>

                            {!loading && (
                                <span aria-hidden="true">→</span>
                            )}
                        </button>
                    </form>

                    <div className="cp-register-divider">
                        <span />
                        <span>WELCOME TO CARE POINT</span>
                        <span />
                    </div>

                    <p className="cp-register-login-prompt">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </p>

                    <p className="cp-register-doctor-prompt">
                        Are you a doctor?{" "}
                        <Link to="/doctor-register">
                            Register as a doctor
                        </Link>
                    </p>

                    <p className="cp-register-footer">
                        Your health matters. Every step of the way.
                    </p>
                </div>
            </section>
        </main>
    );
}

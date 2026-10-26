
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api"

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
                setError("Login succeeded, but the user role was not recognized.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

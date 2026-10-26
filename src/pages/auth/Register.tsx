
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

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

            setSuccess("Registration successful! Please log in.");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Patient Registration</h1>

            <form onSubmit={handleRegister}>
                <div>
                    <label htmlFor="name">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                </div>

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
                        minLength={8}
                        required
                    />
                </div>

                {error && <p role="alert">{error}</p>}
                {success && <p>{success}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}

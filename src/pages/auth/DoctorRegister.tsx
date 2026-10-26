
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./DoctorRegister.css";

export default function DoctorRegister() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [qualification, setQualification] = useState("");
    const [bio, setBio] = useState("");
    const [consultationFee, setConsultationFee] = useState("");
    const [doctorNameOnCertificate, setDoctorNameOnCertificate] = useState("");
    const [certificateSpecialization, setCertificateSpecialization] = useState("");
    const [certificate, setCertificate] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!certificate) {
            setError("Please upload your professional certificate.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        const fee = Number(consultationFee);

        if (consultationFee.trim() === "" || !Number.isFinite(fee) || fee < 0) {
            setError("Enter a valid, non-negative consultation fee.");
            return;
        }

        const formData = new FormData();

        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("password", password);
        formData.append("specialization", specialization.trim());
        formData.append("qualification", qualification.trim());
        formData.append("bio", bio.trim());
        formData.append("consultationFee", String(fee));
        formData.append("doctorNameOnCertificate", doctorNameOnCertificate.trim());
        formData.append("certificateSpecialization", certificateSpecialization.trim());
        formData.append("certificate", certificate);

        setLoading(true);

        try {
            const result = await apiRequest("/doctors/register", {
                method: "POST",
                body: formData,
            });

            setSuccess(result.message || "Registration successful. Your application is awaiting admin approval.");

            window.setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="doctor-register-page">
            <section className="doctor-register-visual">
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

                <div className="doctor-register-visual-content">
                    <span className="doctor-register-eyebrow">
                        YOUR CARE. YOUR IMPACT.
                    </span>

                    <h1>
                        Better care
                        <br />
                        starts here.
                    </h1>

                    <div className="doctor-register-benefits">
                        <div className="doctor-register-benefit">
                            <span>✓</span>
                            <div>
                                <strong>Your practice, simplified</strong>
                                <small>Manage appointments with ease.</small>
                            </div>
                        </div>

                        <div className="doctor-register-benefit">
                            <span>✓</span>
                            <div>
                                <strong>Care that makes a difference</strong>
                                <small>Focus on what matters most — your patients.</small>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="doctor-register-visual-footer">
                    Connecting doctors. Caring for people.
                </p>
            </section>

            <section className="doctor-register-form-side">
                <div className="doctor-register-form-container">
                    <div className="doctor-register-mobile-brand">
                        <span className="doctor-register-brand-icon">+</span>
                        CARE POINT
                    </div>

                    <div className="doctor-register-form-heading">
                        <span className="doctor-register-step">
                            DOCTOR REGISTRATION
                        </span>

                        <h2>Create your professional account</h2>

                        <p>
                            Enter your details and submit your certificate
                            for verification.
                        </p>
                    </div>

                    <form
                        className="doctor-register-form"
                        onSubmit={handleRegister}
                    >
                        <h3>Account details</h3>

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-name">
                                Full name <span>*</span>
                            </label>
                            <input
                                id="doctor-name"
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

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-email">
                                Email address <span>*</span>
                            </label>
                            <input
                                id="doctor-email"
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

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-password">
                                Password <span>*</span>
                            </label>
                            <input
                                id="doctor-password"
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

                        <div className="doctor-register-divider" />

                        <h3>Professional details</h3>

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-specialization">
                                Specialization <span>*</span>
                            </label>
                            <input
                                id="doctor-specialization"
                                type="text"
                                value={specialization}
                                onChange={(event) =>
                                    setSpecialization(event.target.value)
                                }
                                placeholder="e.g. Cardiology"
                                required
                            />
                        </div>

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-qualification">
                                Qualification <span>*</span>
                            </label>
                            <input
                                id="doctor-qualification"
                                type="text"
                                value={qualification}
                                onChange={(event) =>
                                    setQualification(event.target.value)
                                }
                                placeholder="e.g. MBBS, MD"
                                required
                            />
                        </div>

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-fee">
                                Consultation fee (₹) <span>*</span>
                            </label>
                            <input
                                id="doctor-fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={consultationFee}
                                onChange={(event) =>
                                    setConsultationFee(event.target.value)
                                }
                                placeholder="e.g. 500"
                                required
                            />
                        </div>

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-bio">
                                Professional bio
                            </label>
                            <textarea
                                id="doctor-bio"
                                value={bio}
                                onChange={(event) =>
                                    setBio(event.target.value)
                                }
                                placeholder="Briefly describe your experience and approach to patient care."
                                rows={4}
                            />
                            <small>Optional</small>
                        </div>

                        <div className="doctor-register-divider" />

                        <h3>Certificate verification</h3>

                        <p className="doctor-register-section-description">
                            Enter the details exactly as they appear on
                            your professional certificate.
                        </p>

                        <div className="doctor-register-field">
                            <label htmlFor="certificate-doctor-name">
                                Name on certificate <span>*</span>
                            </label>
                            <input
                                id="certificate-doctor-name"
                                type="text"
                                value={doctorNameOnCertificate}
                                onChange={(event) =>
                                    setDoctorNameOnCertificate(
                                        event.target.value
                                    )
                                }
                                placeholder="Name printed on certificate"
                                required
                            />
                        </div>

                        <div className="doctor-register-field">
                            <label htmlFor="certificate-specialization">
                                Certificate specialization <span>*</span>
                            </label>
                            <input
                                id="certificate-specialization"
                                type="text"
                                value={certificateSpecialization}
                                onChange={(event) =>
                                    setCertificateSpecialization(
                                        event.target.value
                                    )
                                }
                                placeholder="Specialty shown on certificate"
                                required
                            />
                        </div>

                        <div className="doctor-register-field">
                            <label htmlFor="doctor-certificate">
                                Upload certificate <span>*</span>
                            </label>

                            <input
                                id="doctor-certificate"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(event) =>
                                    setCertificate(
                                        event.target.files?.[0] ?? null
                                    )
                                }
                                required
                            />

                            <small>
                                Accepted formats: PDF, JPG, JPEG, PNG.
                                Your certificate will be reviewed by an
                                administrator.
                            </small>
                        </div>

                        {error && (
                            <div
                                className="doctor-register-alert error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {success && (
                            <div
                                className="doctor-register-alert success"
                                role="status"
                            >
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="doctor-register-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Submitting application..."
                                : "Submit registration"}
                        </button>

                        <p className="doctor-register-login">
                            Already have an account?{" "}
                            <Link to="/login">Log in</Link>
                        </p>

                        <p className="doctor-register-approval-note">
                            Your doctor account will remain pending until
                            an administrator approves your application.
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}

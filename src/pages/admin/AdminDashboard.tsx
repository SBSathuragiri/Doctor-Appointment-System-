
import { useCallback, useEffect, useState } from "react";
import "./AdminDashboard.css";
import { getAdminDashboardStats, getPendingDoctors, getDoctorCertificateUrl, reviewDoctorApplication, reviewDoctorCertificate, type AdminDashboardStats, type PendingDoctor, } from "../../services/adminService";

const AdminDashboard = () => {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [busyKey, setBusyKey] = useState("");
    const [notice, setNotice] = useState("");

    const loadDashboard = useCallback(async () => {
        setError("");

        try {
            const [statsData, doctorsData] = await Promise.all([
                getAdminDashboardStats(),
                getPendingDoctors(),
            ]);

            setStats(statsData);
            setDoctors(doctorsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const handleOpenCertificate = async (certificateId: string) => {
        setBusyKey(`certificate-${certificateId}`);
        setActionError("");
        setNotice("");

        try {
            const signedUrl = await getDoctorCertificateUrl(certificateId);
            window.open(signedUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Unable to open certificate");
        } finally {
            setBusyKey("");
        }
    };

    const handleCertificateReview = async (
        certificateId: string,
        decision: "approved" | "rejected"
    ) => {
        const confirmed = window.confirm(`Are you sure you want to ${decision} this certificate?`);

        if (!confirmed) return;

        setBusyKey(`certificate-${certificateId}`);
        setActionError("");
        setNotice("");

        try {
            await reviewDoctorCertificate(certificateId, decision);
            setNotice(`Certificate ${decision} successfully.`);
            await loadDashboard();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Unable to review certificate");
        } finally {
            setBusyKey("");
        }
    };

    const handleApplicationReview = async (
        doctorId: string,
        decision: "approved" | "rejected"
    ) => {
        const confirmed = window.confirm(`Are you sure you want to ${decision} this doctor application?`);

        if (!confirmed) return;

        setBusyKey(`doctor-${doctorId}`);
        setActionError("");
        setNotice("");

        try {
            await reviewDoctorApplication(doctorId, decision);
            setNotice(`Doctor application ${decision} successfully.`);
            await loadDashboard();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Unable to review doctor application");
        } finally {
            setBusyKey("");
        }
    };

    const statCards = [
        {
            label: "Approved Doctors",
            value: stats?.approvedDoctors,
            description: "Approved doctor accounts",
            icon: "♙",
            color: "blue",
        },
        {
            label: "Total Patients",
            value: stats?.totalPatients,
            description: "Active patient accounts",
            icon: "♧",
            color: "teal",
        },
        {
            label: "Appointments",
            value: stats?.totalAppointments,
            description: `${stats?.activeAppointments ?? 0} active`,
            icon: "▣",
            color: "purple",
        },
        {
            label: "Pending Approvals",
            value: stats?.pendingDoctors,
            description: "Doctors awaiting review",
            icon: "◷",
            color: "orange",
        },
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-welcome">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Monitor your platform and manage healthcare operations.</p>
                </div>

                <span className="admin-date">
                    {new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </div>

            {error && (
                <div role="alert" className="admin-error">
                    {error}
                    <button type="button" onClick={() => void loadDashboard()}>
                        Retry
                    </button>
                </div>
            )}

            {actionError && (
                <div role="alert" className="admin-error">
                    {actionError}
                </div>
            )}

            {notice && (
                <div className="admin-notice" role="status">
                    {notice}
                </div>
            )}

            <section className="admin-stats-grid">
                {statCards.map((stat) => (
                    <article className="admin-stat-card" key={stat.label}>
                        <div className={`admin-stat-icon ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <p className="admin-stat-label">{stat.label}</p>
                        <h2>{loading ? "…" : stat.value ?? "—"}</h2>
                        <p className="admin-stat-description">{stat.description}</p>
                    </article>
                ))}
            </section>

            <section className="admin-dashboard-grid">
                <article className="admin-panel admin-approvals-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Pending Doctor Approvals</h2>
                            <p>Review doctor details and uploaded certificates.</p>
                        </div>
                        <span className="admin-panel-count">
                            {loading ? "Loading…" : `${doctors.length} pending`}
                        </span>
                    </div>

                    {loading ? (
                        <div className="admin-empty-state">
                            <h3>Loading applications…</h3>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="admin-empty-icon">✓</div>
                            <h3>No pending applications</h3>
                            <p>There are currently no doctors awaiting approval.</p>
                        </div>
                    ) : (
                        <div className="admin-doctor-list">
                            {doctors.map((doctor) => {
                                const certificateId = doctor.certificate_id;
                                const certificateStatus =
                                    doctor.certificate_review_status?.toLowerCase();

                                const certificateBusy =
                                    busyKey === `certificate-${certificateId}`;
                                const doctorBusy =
                                    busyKey === `doctor-${doctor.doctor_id}`;

                                return (
                                    <div
                                        className="admin-doctor-card"
                                        key={doctor.doctor_id}
                                    >
                                        <div className="admin-doctor-info">
                                            <h3>{doctor.name}</h3>
                                            <p>{doctor.email}</p>
                                            <p>
                                                {doctor.specialization} · {doctor.qualification}
                                            </p>
                                            <p>
                                                Consultation fee: ₹
                                                {Number(doctor.consultation_fee).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
                                            <p>
                                                Applied:{" "}
                                                {doctor.applied_at
                                                    ? new Date(
                                                        doctor.applied_at
                                                    ).toLocaleDateString("en-IN")
                                                    : "Date unavailable"}
                                            </p>
                                        </div>

                                        <div className="admin-doctor-actions">
                                            {certificateId ? (
                                                <>
                                                    <p>
                                                        Certificate status:{" "}
                                                        <strong>
                                                            {doctor.certificate_review_status ??
                                                                "Pending"}
                                                        </strong>
                                                    </p>

                                                    <button
                                                        type="button"
                                                        disabled={certificateBusy}
                                                        onClick={() =>
                                                            void handleOpenCertificate(
                                                                certificateId
                                                            )
                                                        }
                                                    >
                                                        {certificateBusy
                                                            ? "Opening…"
                                                            : "View Certificate"}
                                                    </button>

                                                    {certificateStatus === "pending" && (
                                                        <div className="admin-action-row">
                                                            <button
                                                                type="button"
                                                                disabled={certificateBusy}
                                                                onClick={() =>
                                                                    void handleCertificateReview(
                                                                        certificateId,
                                                                        "approved"
                                                                    )
                                                                }
                                                            >
                                                                Approve Certificate
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={certificateBusy}
                                                                onClick={() =>
                                                                    void handleCertificateReview(
                                                                        certificateId,
                                                                        "rejected"
                                                                    )
                                                                }
                                                            >
                                                                Reject Certificate
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p>
                                                    No certificate is attached. The application
                                                    cannot be approved yet.
                                                </p>
                                            )}

                                            <div className="admin-action-row">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        doctorBusy ||
                                                        !certificateId ||
                                                        certificateStatus !== "approved"
                                                    }
                                                    title={
                                                        certificateStatus !== "approved"
                                                            ? "Approve the certificate first"
                                                            : "Approve doctor application"
                                                    }
                                                    onClick={() =>
                                                        void handleApplicationReview(
                                                            doctor.doctor_id,
                                                            "approved"
                                                        )
                                                    }
                                                >
                                                    {doctorBusy
                                                        ? "Processing…"
                                                        : "Approve Doctor"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={doctorBusy}
                                                    onClick={() =>
                                                        void handleApplicationReview(
                                                            doctor.doctor_id,
                                                            "rejected"
                                                        )
                                                    }
                                                >
                                                    Reject Application
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </article>

                <article className="admin-panel admin-appointments-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Appointment Summary</h2>
                            <p>Overview of appointment activity.</p>
                        </div>
                    </div>

                    <div className="admin-appointment-summary">
                        <div>
                            <span>Active</span>
                            <strong>
                                {loading ? "…" : stats?.activeAppointments ?? "—"}
                            </strong>
                        </div>
                        <div>
                            <span>Completed</span>
                            <strong>
                                {loading ? "…" : stats?.completedAppointments ?? "—"}
                            </strong>
                        </div>
                        <div>
                            <span>Cancelled</span>
                            <strong>
                                {loading ? "…" : stats?.cancelledAppointments ?? "—"}
                            </strong>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
};

export default AdminDashboard;

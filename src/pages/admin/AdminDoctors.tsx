
import { useCallback, useEffect, useState } from "react";
import { getPendingDoctors, getDoctorCertificateUrl, reviewDoctorApplication, reviewDoctorCertificate, type PendingDoctor, } from "../../services/adminService";
import "./AdminDoctors.css";

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busyKey, setBusyKey] = useState("");

    const loadDoctors = useCallback(async () => {
        setError("");

        try {
            const data = await getPendingDoctors();
            setDoctors(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load doctor applications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDoctors();
    }, [loadDoctors]);

    const openCertificate = async (certificateId: string) => {
        setBusyKey(`certificate-${certificateId}`);
        setError("");
        setNotice("");

        try {
            const url = await getDoctorCertificateUrl(certificateId);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to open certificate");
        } finally {
            setBusyKey("");
        }
    };

    const reviewCertificate = async (
        certificateId: string,
        decision: "approved" | "rejected"
    ) => {
        if (!window.confirm(`Are you sure you want to ${decision} this certificate?`)) {
            return;
        }

        setBusyKey(`certificate-${certificateId}`);
        setError("");
        setNotice("");

        try {
            await reviewDoctorCertificate(certificateId, decision);
            setNotice(`Certificate ${decision} successfully.`);
            await loadDoctors();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to review certificate");
        } finally {
            setBusyKey("");
        }
    };

    const reviewApplication = async (
        doctorId: string,
        decision: "approved" | "rejected"
    ) => {
        if (!window.confirm(`Are you sure you want to ${decision} this application?`)) {
            return;
        }

        setBusyKey(`doctor-${doctorId}`);
        setError("");
        setNotice("");

        try {
            await reviewDoctorApplication(doctorId, decision);
            setNotice(`Doctor application ${decision} successfully.`);
            await loadDoctors();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to review application");
        } finally {
            setBusyKey("");
        }
    };

    return (
        <div className="admin-doctors-page">
            <div className="admin-welcome">
                <div>
                    <h1>Doctor Management</h1>
                    <p>Review applications and verify professional certificates.</p>
                </div>

                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={() => {
                        setLoading(true);
                        void loadDoctors();
                    }}
                >
                    Refresh
                </button>
            </div>

            <div className="admin-doctors-summary">
                <div>
                    <span>Pending applications</span>
                    <strong>{loading ? "…" : doctors.length}</strong>
                </div>
            </div>

            {error && <div className="admin-error" role="alert">{error}</div>}
            {notice && <div className="admin-notice" role="status">{notice}</div>}

            <section className="admin-panel admin-doctors-panel">
                <div className="admin-panel-heading">
                    <div>
                        <h2>Doctor Applications</h2>
                        <p>Certificate approval is required before doctor approval.</p>
                    </div>
                </div>

                {loading ? (
                    <p className="admin-doctors-message">Loading applications…</p>
                ) : doctors.length === 0 ? (
                    <p className="admin-doctors-message">
                        No pending doctor applications found.
                    </p>
                ) : (
                    <div className="admin-doctors-table-wrapper">
                        <table className="admin-doctors-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Specialization</th>
                                    <th>Fee</th>
                                    <th>Certificate</th>
                                    <th>Application</th>
                                </tr>
                            </thead>

                            <tbody>
                                {doctors.map((doctor) => {
                                    const certificateId = doctor.certificate_id;
                                    const certificateStatus =
                                        doctor.certificate_review_status?.toLowerCase();
                                    const certificateBusy =
                                        busyKey === `certificate-${certificateId}`;
                                    const doctorBusy =
                                        busyKey === `doctor-${doctor.doctor_id}`;

                                    return (
                                        <tr key={doctor.doctor_id}>
                                            <td>
                                                <strong>{doctor.name}</strong>
                                                <span className="admin-doctor-email">
                                                    {doctor.email}
                                                </span>
                                                <span className="admin-doctor-email">
                                                    {doctor.qualification}
                                                </span>
                                            </td>

                                            <td>{doctor.specialization}</td>

                                            <td>
                                                ₹
                                                {Number(
                                                    doctor.consultation_fee
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td>
                                                {certificateId ? (
                                                    <>
                                                        <span
                                                            className={`admin-review-status ${certificateStatus === "approved" ? "is-approved" : certificateStatus === "rejected" ? "is-rejected" : "is-pending"}`}
                                                        >
                                                            {doctor.certificate_review_status ??
                                                                "Pending"}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            className="admin-table-button"
                                                            disabled={certificateBusy}
                                                            onClick={() =>
                                                                void openCertificate(certificateId)
                                                            }
                                                        >
                                                            View certificate
                                                        </button>

                                                        {certificateStatus === "pending" && (
                                                            <div className="admin-table-actions">
                                                                <button
                                                                    type="button"
                                                                    disabled={certificateBusy}
                                                                    onClick={() =>
                                                                        void reviewCertificate(
                                                                            certificateId,
                                                                            "approved"
                                                                        )
                                                                    }
                                                                >
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={certificateBusy}
                                                                    onClick={() =>
                                                                        void reviewCertificate(
                                                                            certificateId,
                                                                            "rejected"
                                                                        )
                                                                    }
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="admin-review-status is-rejected">
                                                        Missing
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <div className="admin-table-actions">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            doctorBusy ||
                                                            !certificateId ||
                                                            certificateStatus !== "approved"
                                                        }
                                                        title={
                                                            certificateStatus !== "approved"
                                                                ? "Approve certificate first"
                                                                : "Approve doctor"
                                                        }
                                                        onClick={() =>
                                                            void reviewApplication(
                                                                doctor.doctor_id,
                                                                "approved"
                                                            )
                                                        }
                                                    >
                                                        Approve doctor
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={doctorBusy}
                                                        onClick={() =>
                                                            void reviewApplication(
                                                                doctor.doctor_id,
                                                                "rejected"
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>

                                                {doctor.applied_at && (
                                                    <span className="admin-doctor-email">
                                                        Applied{" "}
                                                        {new Date(
                                                            doctor.applied_at
                                                        ).toLocaleDateString("en-IN")}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminDoctors;

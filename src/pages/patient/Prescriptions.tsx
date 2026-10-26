
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Prescriptions.css";

interface Prescription {
    id: string | number;
    appointment_id: string | number;
    diagnosis: string;
    medicines: unknown;
    instructions: string | null;
    created_at: string;
    doctor_name: string;
    specialization: string;
    appointment_start_time: string;
}

function formatMedicines(medicines: unknown): string {
    if (typeof medicines === "string") {
        return medicines;
    }

    if (medicines == null) {
        return "No medicines listed.";
    }

    return JSON.stringify(medicines, null, 2);
}

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/appointments/my/prescriptions")
            .then((result) => {
                setPrescriptions(result.data);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load prescriptions.");
            })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });
    };

    return (
        <div className="prescriptions-page">
            <div className="prescriptions-header">
                <h2>My Prescriptions</h2>
                <p>View your diagnoses, medicines, and doctor's instructions.</p>
            </div>

            {loading && (
                <p className="prescriptions-message">
                    Loading prescriptions...
                </p>
            )}

            {error && (
                <p className="prescriptions-error" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && prescriptions.length === 0 && (
                <div className="prescriptions-empty">
                    <h3>No prescriptions yet</h3>
                    <p>
                        Prescriptions provided by your doctors will appear here.
                    </p>
                </div>
            )}

            {!loading && !error && prescriptions.length > 0 && (
                <div className="prescriptions-list">
                    {prescriptions.map((prescription) => (
                        <article
                            className="prescription-card"
                            key={prescription.id}
                        >
                            <div className="prescription-card-header">
                                <div>
                                    <h3>{prescription.diagnosis}</h3>
                                    <p>{prescription.doctor_name}</p>
                                    <span>{prescription.specialization}</span>
                                </div>

                                <span className="prescription-date">
                                    {formatDate(prescription.created_at)}
                                </span>
                            </div>

                            <div className="prescription-section">
                                <h4>Medicines</h4>
                                <pre>{formatMedicines(prescription.medicines)}</pre>
                            </div>

                            <div className="prescription-section">
                                <h4>Doctor's Instructions</h4>
                                <p>
                                    {prescription.instructions ||
                                        "No additional instructions provided."}
                                </p>
                            </div>

                            <p className="prescription-appointment">
                                Appointment ID: #{prescription.appointment_id}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

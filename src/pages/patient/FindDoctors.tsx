
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./FindDoctors.css";
import { useNavigate } from "react-router-dom";

interface Doctor {
    doctor_id: string;
    name: string;
    specialization: string;
    qualification: string;
    bio: string;
    consultation_fee: string;
}

export default function FindDoctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const Navigate = useNavigate()

    useEffect(() => {
        apiRequest("/doctors")
            .then((result) => {
                setDoctors(result.data);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load doctors.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="find-doctors-page">
            <div className="find-doctors-header">
                <h2>Find Doctors</h2>
                <p>Browse approved doctors and find the right care for you.</p>
            </div>

            {loading && (
                <p className="doctors-loading">Loading doctors...</p>
            )}

            {error && (
                <p className="doctors-error" role="alert">{error}</p>
            )}

            {!loading && !error && doctors.length === 0 && (
                <p className="doctors-empty">No approved doctors are available right now.</p>
            )}

            {!loading && !error && doctors.length > 0 && (
                <div className="doctor-list">
                    {doctors.map((doctor) => (
                        <article className="doctor-card" key={doctor.doctor_id}>
                            <div className="doctor-card-info">
                                <h3>{doctor.name}</h3>
                                <p>{doctor.specialization}</p>
                                <p>{doctor.qualification}</p>
                                <p>{doctor.bio || "No biography available."}</p>
                            </div>

                            <div className="doctor-card-fee">
                                <p>Consultation fee</p>
                                <strong>₹{Number(doctor.consultation_fee).toFixed(2)}</strong>
                            </div>

                            <button type="button" onClick={() => Navigate(`/patient/doctors/${doctor.doctor_id}/availability`)}>
                                View Availability
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

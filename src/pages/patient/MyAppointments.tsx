
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./MyAppointments.css";

interface Appointment {
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    specialization: string;
    qualification: string;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    doctorFee: string;
    commissionFee: string;
    totalFee: string;
    status: string;
    bookedAt: string;
}

export default function MyAppointments() {

    type AppointmentFilter = "all" | "booked" | "completed" | "cancelled";

    const [filter, setFilter] = useState<AppointmentFilter>("all");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/appointments/my-booking-slots")
            .then((result) => {
                setAppointments(result.data);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load appointments.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const formatDate = (date: string) => {
        const dateOnly = date.slice(0, 10);
        const [year, month, day] = dateOnly.split("-").map(Number);

        return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });
    };

    const filteredAppointments = filter === "all" ? appointments : appointments.filter((appointment) => appointment.status.toLowerCase() === filter);

    return (
        <div className="my-appointments-page">
            <div className="my-appointments-header">
                <h2>My Appointments</h2>
                <p>View and track your doctor appointments.</p>
            </div>

            <div className="appointment-filters">
                {(["all", "booked", "completed", "cancelled"] as const).map(
                    (status) => (
                        <button
                            key={status}
                            type="button"
                            className={`filter-${status} ${filter === status ? "active" : ""}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    )
                )}
            </div>

            {loading && (
                <p className="appointments-message">
                    Loading your appointments...
                </p>
            )}

            {error && (
                <p className="appointments-error" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && appointments.length === 0 && (
                <div className="appointments-empty">
                    <h3>No appointments yet</h3>
                    <p>Your booked appointments will appear here.</p>
                </div>
            )}

            {!loading && !error && filteredAppointments.length > 0 && (
                <div className="appointments-list">
                    {filteredAppointments.map((appointment) => (
                        <article
                            className="appointment-card"
                            key={appointment.appointmentId}
                        >
                            <div className="appointment-card-header">
                                <div>
                                    <h3>{appointment.doctorName}</h3>
                                    <p>{appointment.specialization}</p>
                                    <span>{appointment.qualification}</span>
                                </div>

                                <span className={`appointment-status status-${appointment.status.toLowerCase()}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="appointment-details">
                                <div>
                                    <span className="detail-label">
                                        Appointment date
                                    </span>
                                    <strong>
                                        {formatDate(appointment.appointmentDate)}
                                    </strong>
                                </div>

                                <div>
                                    <span className="detail-label">
                                        Appointment time
                                    </span>
                                    <strong>
                                        {formatTime(appointment.startTime)} –{" "}
                                        {formatTime(appointment.endTime)}
                                    </strong>
                                </div>

                                <div>
                                    <span className="detail-label">
                                        Appointment ID
                                    </span>
                                    <strong>#{appointment.appointmentId}</strong>
                                </div>
                            </div>

                            <div className="appointment-fees">
                                <div>
                                    <span>Doctor fee</span>
                                    <span>
                                        ₹{Number(appointment.doctorFee).toFixed(2)}
                                    </span>
                                </div>

                                <div>
                                    <span>Other Charges</span>
                                    <span>
                                        ₹{Number(appointment.commissionFee).toFixed(2)}
                                    </span>
                                </div>

                                <div className="appointment-total">
                                    <strong>Total fee</strong>
                                    <strong>
                                        ₹{Number(appointment.totalFee).toFixed(2)}
                                    </strong>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

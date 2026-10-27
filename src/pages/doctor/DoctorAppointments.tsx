
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import './DoctorAppointments.css'

interface Appointment {
    appointmentId: string;
    patientId: string;
    patientName: string;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    doctorFee: number | string;
    commissionFee: number | string;
    totalFee: number | string;
    status: string;
    bookedAt: string;
}

function formatDate(date: string) {
    const dateOnly = date.slice(0, 10);
    const [year, month, day] = dateOnly.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(time: string) {
    return new Date(time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });
}

export default function DoctorAppointments() {

    type AppointmentFilter = "all" | "booked" | "confirmed" | "completed" | "cancelled";

    const [prescriptionAppointmentId, setPrescriptionAppointmentId] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState("");
    const [medicines, setMedicines] = useState("");
    const [instructions, setInstructions] = useState("");
    const [prescriptionLoading, setPrescriptionLoading] = useState(false);
    const [filter, setFilter] = useState<AppointmentFilter>("booked");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        apiRequest("/appointments/doctor")
            .then((result) => {
                setAppointments(result.data);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load appointments.");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleConfirmAppointment = async (
        appointmentId: string
    ) => {
        try {
            setActionLoadingId(appointmentId);
            setActionMessage("");
            setActionError("");

            await apiRequest(
                `/appointments/${appointmentId}/confirm`,
                {
                    method: "PATCH",
                }
            );

            setAppointments((previous) =>
                previous.map((appointment) =>
                    appointment.appointmentId === appointmentId
                        ? { ...appointment, status: "confirmed" }
                        : appointment
                )
            );

            setActionMessage("Appointment confirmed successfully.");
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to confirm appointment."
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this appointment? The patient will be notified."
        );

        if (!confirmed) return;

        setActionLoadingId(appointmentId);
        setActionMessage("");
        setActionError("");

        try {
            await apiRequest(`/appointments/${appointmentId}/cancel`, {
                method: "PATCH",
            });

            setAppointments((previous) =>
                previous.map((appointment) =>
                    appointment.appointmentId === appointmentId
                        ? { ...appointment, status: "cancelled" }
                        : appointment
                )
            );

            setActionMessage("Appointment cancelled successfully.");
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to cancel appointment."
            );
        } finally {
            setActionLoadingId(null);
        }
    };


    const handleAddPrescription = async (appointmentId: string) => {
        if (!medicines.trim()) {
            setActionError("Please enter the prescribed medicines.");
            return;
        }

        setPrescriptionLoading(true);
        setActionMessage("");
        setActionError("");

        try {
            await apiRequest(
                `/appointments/${appointmentId}/prescriptions`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        diagnosis: diagnosis.trim() || null,
                        medicines: medicines.trim(),
                        instructions: instructions.trim() || null,
                    }),
                }
            );

            setAppointments((previous) =>
                previous.map((appointment) =>
                    appointment.appointmentId === appointmentId
                        ? { ...appointment, status: "completed" }
                        : appointment
                )
            );

            setActionMessage("Prescription saved and appointment completed.");
            setPrescriptionAppointmentId(null);
            setDiagnosis("");
            setMedicines("");
            setInstructions("");
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to save prescription."
            );
        } finally {
            setPrescriptionLoading(false);
        }
    };


    if (loading) {
        return <p>Loading appointments...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    const filteredAppointments =
        filter === "all"
            ? appointments :
            appointments.filter(
                (appointment) =>
                    appointment.status.toLowerCase() === filter);

    return (
        <div className="doctor-appointments">
            <div className="appointments-heading">
                <div>
                    <h2>My Appointments</h2>
                    <p>View your patients and scheduled consultations.</p>
                </div>

                <span className="appointment-count">
                    {appointments.length} total
                </span>
            </div>

            <div className="appointment-filters">
                {(["all", "booked", "confirmed", "completed", "cancelled"] as const).map(
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

            {actionMessage && <p role="status">{actionMessage}</p>}
            {actionError && <p role="alert">{actionError}</p>}

            {filteredAppointments.length === 0 ? (
                <div className="appointments-empty">
                    <h3>No appointments yet</h3>
                    <p>Your booked appointments will appear here.</p>
                </div>
            ) : (
                <div className="appointments-table-wrapper">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Total Fee</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.appointmentId}>
                                    <td>
                                        <strong>{appointment.patientName}</strong>
                                        <small>
                                            ID: {appointment.appointmentId}
                                        </small>
                                    </td>

                                    <td>
                                        {formatDate(appointment.appointmentDate)}
                                    </td>

                                    <td>
                                        {formatTime(appointment.startTime)}
                                        {" – "}
                                        {formatTime(appointment.endTime)}
                                    </td>

                                    <td>
                                        ₹{Number(appointment.totalFee).toFixed(2)}
                                    </td>

                                    <td>
                                        <span
                                            className={`appointment-status status-${appointment.status.toLowerCase()}`}
                                        >
                                            {appointment.status.replaceAll("_", " ")}
                                        </span>
                                    </td>

                                    <td>
                                        {appointment.status.toLowerCase() === "booked" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="confirm-appointment-btn"
                                                    onClick={() =>
                                                        handleConfirmAppointment(
                                                            appointment.appointmentId
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoadingId === appointment.appointmentId
                                                    }
                                                >
                                                    {actionLoadingId === appointment.appointmentId
                                                        ? "Confirming..."
                                                        : "Confirm Appointment"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cancel-appointment-btn"
                                                    onClick={() =>
                                                        handleCancelAppointment(
                                                            appointment.appointmentId
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoadingId === appointment.appointmentId
                                                    }
                                                >
                                                    {actionLoadingId === appointment.appointmentId
                                                        ? "Processing..."
                                                        : "Cancel Appointment"}
                                                </button>
                                            </>
                                        )}

                                        {appointment.status.toLowerCase() === "confirmed" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="complete-appointment-btn"
                                                    onClick={() => {
                                                        setPrescriptionAppointmentId(
                                                            appointment.appointmentId
                                                        );
                                                        setDiagnosis("");
                                                        setMedicines("");
                                                        setInstructions("");
                                                        setActionMessage("");
                                                        setActionError("");
                                                    }}
                                                    disabled={
                                                        actionLoadingId === appointment.appointmentId
                                                    }
                                                >
                                                    Complete & Prescribe
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cancel-appointment-btn"
                                                    onClick={() =>
                                                        handleCancelAppointment(
                                                            appointment.appointmentId
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoadingId === appointment.appointmentId
                                                    }
                                                >
                                                    {actionLoadingId === appointment.appointmentId
                                                        ? "Processing..."
                                                        : "Cancel Appointment"}
                                                </button>
                                            </>
                                        )}

                                        {!["booked", "confirmed"].includes(
                                            appointment.status.toLowerCase()
                                        ) && (
                                                <span className="no-action-text">No action</span>
                                            )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}

            {prescriptionAppointmentId && (
                <div className="prescription-modal-backdrop">
                    <div
                        className="prescription-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="prescription-modal-title"
                    >
                        <h2 id="prescription-modal-title">
                            Complete & Prescribe
                        </h2>

                        <p>
                            Appointment ID: {prescriptionAppointmentId}
                        </p>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleAddPrescription(
                                    prescriptionAppointmentId
                                );
                            }}
                        >
                            <label htmlFor="diagnosis">
                                Diagnosis
                            </label>
                            <input
                                id="diagnosis"
                                type="text"
                                value={diagnosis}
                                onChange={(event) =>
                                    setDiagnosis(event.target.value)
                                }
                                placeholder="Enter diagnosis"
                            />

                            <label htmlFor="medicines">
                                Medicines *
                            </label>
                            <textarea
                                id="medicines"
                                value={medicines}
                                onChange={(event) =>
                                    setMedicines(event.target.value)
                                }
                                placeholder="Medicine, dosage, frequency and duration"
                                required
                            />

                            <label htmlFor="instructions">
                                Instructions
                            </label>
                            <textarea
                                id="instructions"
                                value={instructions}
                                onChange={(event) =>
                                    setInstructions(event.target.value)
                                }
                                placeholder="Additional instructions for the patient"
                            />

                            {actionError && (
                                <p role="alert">{actionError}</p>
                            )}

                            <div className="prescription-modal-actions">
                                <button
                                    type="submit"
                                    className="complete-appointment-btn"
                                    disabled={
                                        prescriptionLoading ||
                                        !medicines.trim()
                                    }
                                >
                                    {prescriptionLoading
                                        ? "Saving..."
                                        : "Submit Prescription & Complete"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPrescriptionAppointmentId(null)
                                    }
                                    disabled={prescriptionLoading}
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

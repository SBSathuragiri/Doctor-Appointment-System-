
import { useEffect, useMemo, useState } from "react";
import { getAdminAppointments, type AdminAppointment, } from "../../services/adminService";
import "./AdminAppointments.css";

const formatDate = (value: string) => {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (value: string) => {
    return new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const formatCurrency = (value: string) =>
    Number(value).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getAdminAppointments();
            setAppointments(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load appointments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadAppointments();
    }, []);

    const filteredAppointments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const matchesSearch =
                !query ||
                appointment.appointmentId.toLowerCase().includes(query) ||
                appointment.patientName.toLowerCase().includes(query) ||
                appointment.doctorName.toLowerCase().includes(query) ||
                appointment.specialization?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                appointment.status.toLowerCase() === statusFilter;

            const matchesDate =
                !dateFilter ||
                appointment.appointmentDate.slice(0, 10) === dateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [appointments, search, statusFilter, dateFilter]);

    const completedCount = appointments.filter(
        (a) => a.status.toLowerCase() === "completed"
    ).length;

    const cancelledCount = appointments.filter(
        (a) => a.status.toLowerCase() === "cancelled"
    ).length;

    const activeCount = appointments.filter((a) =>
        ["booked", "confirmed", "rescheduled"].includes(
            a.status.toLowerCase()
        )
    ).length;

    const totalCommission = appointments
        .filter((a) => a.status.toLowerCase() !== "cancelled")
        .reduce((sum, a) => sum + Number(a.commissionFee || 0), 0);

    return (
        <div className="admin-appointments">
            <div className="admin-appointments-heading">
                <div>
                    <h1>Appointments</h1>
                    <p>Monitor bookings, appointment statuses, and fees.</p>
                </div>

                <button
                    className="appointments-refresh"
                    onClick={() => void loadAppointments()}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh"}
                </button>
            </div>

            <div className="appointments-stats">
                <div className="appointment-stat-card">
                    <span>Total appointments</span>
                    <strong>{appointments.length}</strong>
                </div>
                <div className="appointment-stat-card">
                    <span>Active bookings</span>
                    <strong>{activeCount}</strong>
                </div>
                <div className="appointment-stat-card">
                    <span>Completed</span>
                    <strong>{completedCount}</strong>
                </div>
                <div className="appointment-stat-card">
                    <span>Cancelled</span>
                    <strong>{cancelledCount}</strong>
                </div>
                <div className="appointment-stat-card">
                    <span>Recorded commission</span>
                    <strong>{formatCurrency(String(totalCommission))}</strong>
                </div>
            </div>

            <div className="appointments-filters">
                <input
                    type="search"
                    placeholder="Search patient, doctor, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All statuses</option>
                    <option value="booked">Booked</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <input
                    type="date"
                    aria-label="Filter by appointment date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />

                <button
                    className="appointments-clear"
                    onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setDateFilter("");
                    }}
                >
                    Clear filters
                </button>
            </div>

            {error && (
                <div className="appointments-error">
                    <p>{error}</p>
                    <button onClick={() => void loadAppointments()}>
                        Try again
                    </button>
                </div>
            )}

            <div className="appointments-table-card">
                <div className="appointments-table-heading">
                    <div>
                        <h2>All appointments</h2>
                        <p>
                            {filteredAppointments.length} result
                            {filteredAppointments.length === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="appointments-message">
                        Loading appointments...
                    </div>
                ) : !error && filteredAppointments.length === 0 ? (
                    <div className="appointments-message">
                        No appointments match your filters.
                    </div>
                ) : !error ? (
                    <div className="appointments-table-scroll">
                        <table className="appointments-table">
                            <thead>
                                <tr>
                                    <th>Appointment</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date & time</th>
                                    <th>Doctor fee</th>
                                    <th>Commission</th>
                                    <th>Total fee</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.appointmentId}>
                                        <td>
                                            <strong>
                                                #{appointment.appointmentId}
                                            </strong>
                                        </td>
                                        <td>
                                            <strong>{appointment.patientName}</strong>
                                            <small>ID: {appointment.patientId}</small>
                                        </td>
                                        <td>
                                            <strong>{appointment.doctorName}</strong>
                                            <small>
                                                {appointment.specialization || "Specialization unavailable"}
                                            </small>
                                        </td>
                                        <td>
                                            <strong>
                                                {formatDate(appointment.appointmentDate)}
                                            </strong>
                                            <small>
                                                {formatTime(appointment.startTime)}
                                                {" – "}
                                                {formatTime(appointment.endTime)}
                                            </small>
                                        </td>
                                        <td>{formatCurrency(appointment.doctorFee)}</td>
                                        <td>{formatCurrency(appointment.commissionFee)}</td>
                                        <td>
                                            <strong>
                                                {formatCurrency(appointment.totalFee)}
                                            </strong>
                                        </td>
                                        <td>
                                            <span
                                                className={`appointment-status appointment-status-${appointment.status.toLowerCase()}`}
                                            >
                                                {appointment.status.replaceAll("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AdminAppointments;

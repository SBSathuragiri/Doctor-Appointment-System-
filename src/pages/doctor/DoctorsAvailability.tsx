
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./DoctorsAvailability.css";

type DoctorAvailabilityRecord = {
    id: string;
    availability_date: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    max_appointments: number;
    status: "available" | "unavailable";
    total_slots: number;
    available_slots: number;
    blocked_slots: number;
};

type AvailabilityMode = "full-day" | "half-day" | "custom";
type CancelMode = "full-day" | "half-day";

const INDIA_TIME_ZONE = "Asia/Kolkata";

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-CA", {
        timeZone: INDIA_TIME_ZONE,
    });

const formatDisplayDate = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: INDIA_TIME_ZONE,
    });

const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: INDIA_TIME_ZONE,
    });

export default function DoctorAvailability() {

    const [activeTab, setActiveTab] = useState<"manage" | "schedules">("manage");
    const [activePanel, setActivePanel] = useState<"add" | "cancel">("add");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [slotDuration, setSlotDuration] = useState(30);
    const [maxAppointments, setMaxAppointments] = useState(10);
    const [availabilityMode, setAvailabilityMode] = useState<AvailabilityMode>("full-day");
    const [halfDayPeriod, setHalfDayPeriod] = useState<"morning" | "afternoon">("morning");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [unavailableDate, setUnavailableDate] = useState("");
    const [cancelMode, setCancelMode] = useState<CancelMode>("full-day");
    const [cancelPeriod, setCancelPeriod] = useState<"morning" | "afternoon">("morning");
    const [cancelling, setCancelling] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");
    const [cancelError, setCancelError] = useState("");
    const [availabilities, setAvailabilities] = useState<DoctorAvailabilityRecord[]>([]);
    const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
    const [availabilityLoadError, setAvailabilityLoadError] = useState("");

    const loadAvailabilities = async () => {
        setLoadingAvailabilities(true);
        setAvailabilityLoadError("");

        try {
            const result = await apiRequest("/doctors/availability/my", {
                method: "GET",
            });

            setAvailabilities(result.data ?? []);
        } catch (err) {
            setAvailabilityLoadError(err instanceof Error ? err.message : "Failed to load availability records.");
        } finally {
            setLoadingAvailabilities(false);
        }
    };

    useEffect(() => {
        void loadAvailabilities();
    }, []);

    useEffect(() => {
        if (availabilityMode === "full-day") {
            setStartTime("09:00");
            setEndTime("17:00");
        } else if (availabilityMode === "half-day") {
            if (halfDayPeriod === "morning") {
                setStartTime("09:00");
                setEndTime("13:00");
            } else {
                setStartTime("13:00");
                setEndTime("17:00");
            }
        }
    }, [availabilityMode, halfDayPeriod]);

    useEffect(() => {
        if (!startTime || !endTime || slotDuration <= 0) return;

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

        if (durationMinutes <= 0) return;

        const possibleSlots = Math.floor(durationMinutes / slotDuration);

        if (possibleSlots > 0) {
            setMaxAppointments((current) => Math.min(Math.max(current, 1), possibleSlots));
        }
    }, [startTime, endTime, slotDuration]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!date || !startTime || !endTime) {
            setError("Please fill in all required fields.");
            return;
        }

        const start = new Date(`${date}T${startTime}:00+05:30`);
        const end = new Date(`${date}T${endTime}:00+05:30`);

        if (end <= start) {
            setError("End time must be later than start time.");
            return;
        }

        setLoading(true);

        try {
            const result = await apiRequest("/doctors/availability", {
                method: "POST",
                body: JSON.stringify({
                    availabilityDate: date,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    slotDurationMinutes: slotDuration,
                    maxAppointments,
                }),
            });

            setMessage(result.message || "Availability created successfully.");

            setDate("");
            setStartTime("09:00");
            setEndTime("17:00");
            setSlotDuration(30);
            setMaxAppointments(10);
            setAvailabilityMode("full-day");
            setHalfDayPeriod("morning");

            await loadAvailabilities();
            setActiveTab("schedules");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create availability.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAvailability = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setCancelMessage("");
        setCancelError("");

        if (!unavailableDate) {
            setCancelError("Please select a date.");
            return;
        }

        const matchingSchedules = availabilities.filter((item) => item.status === "available" && formatDate(item.availability_date) === unavailableDate);

        if (matchingSchedules.length === 0) {
            setCancelError(
                "No available schedules were found for the selected date."
            );
            return;
        }

        const startTime = cancelPeriod === "morning" ? "09:00" : "13:00";
        const endTime = cancelPeriod === "morning" ? "13:00" : "17:00";

        const periodDescription = cancelMode === "full-day" ? "the entire day (9 AM – 5 PM)" : `${cancelPeriod} (${startTime} – ${endTime})`;

        const confirmed = window.confirm(`Cancel availability for ${formatDisplayDate(`${unavailableDate}T00:00:00+05:30`)}?\n\n` +
            `Period: ${periodDescription}\n\n` +
            `Booked or confirmed appointments in the affected period may be cancelled, and patients will be notified. Continue?`
        );

        if (!confirmed) return;

        setCancelling(true);

        try {
            let appointmentsCancelled = 0;

            if (cancelMode === "half-day") {
                const result = await apiRequest("/doctors/availability/unavailable-time-range",
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            availabilityDate: unavailableDate,
                            startTime,
                            endTime,
                            reason: "Doctor unavailable",
                        }),
                    }
                );

                appointmentsCancelled = result.data?.appointmentsCancelled ?? 0;
            } else {
                for (const schedule of matchingSchedules) {
                    const result = await apiRequest(`/doctors/availability/${schedule.id}/unavailable`,
                        { method: "PATCH" }
                    );

                    appointmentsCancelled += result.data?.appointmentsCancelled ?? 0;
                }
            }
            setCancelMessage(`Availability updated successfully. Appointments cancelled: ${appointmentsCancelled}.`);
            await loadAvailabilities();
        } catch (err) {
            setCancelError(err instanceof Error ? err.message : "Failed to cancel availability.");
            await loadAvailabilities();
        } finally {
            setCancelling(false);
        }
    };

    const availableSchedules = availabilities.filter((item) => item.status === "available");
    const unavailableSchedules = availabilities.filter((item) => item.status === "unavailable");
    const totalSlots = availabilities.reduce((total, item) => total + item.total_slots, 0);
    const availableSlots = availabilities.reduce((total, item) => total + item.available_slots, 0);

    return (
        <div className="doctor-availability-page">
            <header className="availability-heading">
                <h1>Manage Availability</h1>
                <p>
                    Set your appointment hours and manage unexpected changes
                    to your schedule.
                </p>
            </header>

            {/* Main tabs */}
            <div
                className="availability-tabs"
                role="tablist"
                aria-label="Availability sections"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "manage"}
                    className={`availability-tab ${activeTab === "manage" ? "active" : ""
                        }`}
                    onClick={() => setActiveTab("manage")}
                >
                    Manage Availability
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "schedules"}
                    className={`availability-tab ${activeTab === "schedules" ? "active" : ""
                        }`}
                    onClick={() => setActiveTab("schedules")}
                >
                    Schedules
                </button>
            </div>

            {/* Manage Availability tab */}
            {activeTab === "manage" && (
                <section className="availability-tab-content">
                    <div
                        className="availability-actions"
                        role="group"
                        aria-label="Availability actions"
                    >
                        <button
                            type="button"
                            className={`availability-action-button add-action ${activePanel === "add" ? "active" : ""
                                }`}
                            onClick={() => {
                                setActivePanel("add");
                                setMessage("");
                                setError("");
                            }}
                        >
                            <span className="action-icon" aria-hidden="true">
                                +
                            </span>
                            <span>
                                <strong>Add Availability</strong>
                                <small>
                                    Create bookable appointment hours
                                </small>
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`availability-action-button cancel-action ${activePanel === "cancel" ? "active" : ""
                                }`}
                            onClick={() => {
                                setActivePanel("cancel");
                                setCancelMessage("");
                                setCancelError("");
                            }}
                        >
                            <span className="action-icon" aria-hidden="true">
                                −
                            </span>
                            <span>
                                <strong>Cancel Availability</strong>
                                <small>
                                    Block hours when you cannot attend
                                </small>
                            </span>
                        </button>
                    </div>

                    {/* Add Availability form */}
                    {activePanel === "add" && (
                        <section className="availability-panel">
                            <div className="availability-panel-heading">
                                <h2>Add Availability</h2>
                                <p>
                                    Create time slots that patients can book.
                                </p>
                            </div>

                            <form
                                className="availability-form"
                                onSubmit={handleSubmit}
                            >
                                <label htmlFor="availability-date">
                                    Date
                                </label>
                                <input
                                    id="availability-date"
                                    type="date"
                                    value={date}
                                    onChange={(event) =>
                                        setDate(event.target.value)
                                    }
                                    required
                                />

                                <label htmlFor="availability-mode">
                                    Availability type
                                </label>
                                <select
                                    id="availability-mode"
                                    value={availabilityMode}
                                    onChange={(event) =>
                                        setAvailabilityMode(
                                            event.target.value as AvailabilityMode
                                        )
                                    }
                                >
                                    <option value="full-day">
                                        Full day (9 AM – 5 PM)
                                    </option>
                                    <option value="half-day">
                                        Half day
                                    </option>
                                    <option value="custom">
                                        Custom hours
                                    </option>
                                </select>

                                {availabilityMode === "half-day" && (
                                    <>
                                        <label htmlFor="half-day-period">
                                            Half-day period
                                        </label>
                                        <select
                                            id="half-day-period"
                                            value={halfDayPeriod}
                                            onChange={(event) =>
                                                setHalfDayPeriod(
                                                    event.target.value as
                                                    | "morning"
                                                    | "afternoon"
                                                )
                                            }
                                        >
                                            <option value="morning">
                                                Morning (9 AM – 1 PM)
                                            </option>
                                            <option value="afternoon">
                                                Afternoon (1 PM – 5 PM)
                                            </option>
                                        </select>
                                    </>
                                )}

                                <div className="availability-time-grid">
                                    <div>
                                        <label htmlFor="start-time">
                                            Start time
                                        </label>
                                        <input
                                            id="start-time"
                                            type="time"
                                            value={startTime}
                                            onChange={(event) =>
                                                setStartTime(
                                                    event.target.value
                                                )
                                            }
                                            readOnly={
                                                availabilityMode !== "custom"
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="end-time">
                                            End time
                                        </label>
                                        <input
                                            id="end-time"
                                            type="time"
                                            value={endTime}
                                            onChange={(event) =>
                                                setEndTime(
                                                    event.target.value
                                                )
                                            }
                                            readOnly={
                                                availabilityMode !== "custom"
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <label htmlFor="slot-duration">
                                    Duration per appointment
                                </label>
                                <select
                                    id="slot-duration"
                                    value={slotDuration}
                                    onChange={(event) =>
                                        setSlotDuration(
                                            Number(event.target.value)
                                        )
                                    }
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={20}>20 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                </select>

                                <label htmlFor="max-appointments">
                                    Maximum appointments
                                </label>
                                <input
                                    id="max-appointments"
                                    type="number"
                                    min={1}
                                    value={maxAppointments}
                                    onChange={(event) =>
                                        setMaxAppointments(
                                            Number(event.target.value)
                                        )
                                    }
                                    required
                                />

                                <p className="availability-hint">
                                    The server validates the date and creates
                                    the appointment slots.
                                </p>

                                {message && (
                                    <p
                                        className="availability-success"
                                        role="status"
                                    >
                                        {message}
                                    </p>
                                )}

                                {error && (
                                    <p
                                        className="availability-error"
                                        role="alert"
                                    >
                                        {error}
                                    </p>
                                )}

                                <button type="submit" disabled={loading}>
                                    {loading
                                        ? "Saving..."
                                        : "Save Availability"}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Cancel Availability form */}
                    {activePanel === "cancel" && (
                        <section className="availability-panel cancel-panel">
                            <div className="availability-panel-heading">
                                <h2>Cancel Availability</h2>
                                <p>
                                    Choose the date and period you will be
                                    unavailable. Affected appointments are
                                    handled by the server.
                                </p>
                            </div>

                            <form
                                className="availability-form"
                                onSubmit={handleCancelAvailability}
                            >
                                <label htmlFor="unavailable-date">
                                    Date to cancel
                                </label>
                                <input
                                    id="unavailable-date"
                                    type="date"
                                    value={unavailableDate}
                                    onChange={(event) =>
                                        setUnavailableDate(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                                <label htmlFor="cancel-mode">
                                    Unavailable period
                                </label>
                                <select
                                    id="cancel-mode"
                                    value={cancelMode}
                                    onChange={(event) =>
                                        setCancelMode(
                                            event.target.value as CancelMode
                                        )
                                    }
                                >
                                    <option value="full-day">
                                        Full day (all day schedules)
                                    </option>
                                    <option value="half-day">
                                        Half day
                                    </option>
                                </select>

                                {cancelMode === "half-day" && (
                                    <>
                                        <label htmlFor="cancel-period">
                                            Select half day
                                        </label>
                                        <select
                                            id="cancel-period"
                                            value={cancelPeriod}
                                            onChange={(event) =>
                                                setCancelPeriod(
                                                    event.target.value as
                                                    | "morning"
                                                    | "afternoon"
                                                )
                                            }
                                        >
                                            <option value="morning">
                                                Morning (9 AM – 1 PM)
                                            </option>
                                            <option value="afternoon">
                                                Afternoon (1 PM – 5 PM)
                                            </option>
                                        </select>
                                    </>
                                )}

                                <div className="cancel-warning">
                                    <strong>Before you continue</strong>
                                    <p>
                                        Slots in the selected period may be
                                        blocked. Booked appointments may be
                                        cancelled and patients notified. This
                                        action may not be reversible.
                                    </p>
                                </div>

                                {cancelMessage && (
                                    <p
                                        className="availability-success"
                                        role="status"
                                    >
                                        {cancelMessage}
                                    </p>
                                )}

                                {cancelError && (
                                    <p
                                        className="availability-error"
                                        role="alert"
                                    >
                                        {cancelError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="cancel-submit-button"
                                    disabled={
                                        cancelling || loadingAvailabilities
                                    }
                                >
                                    {cancelling
                                        ? "Cancelling..."
                                        : "Confirm Cancellation"}
                                </button>
                            </form>
                        </section>
                    )}
                </section>
            )}

            {/* Schedules tab */}
            {activeTab === "schedules" && (
                <section className="availability-tab-content">
                    {/* Summary cards only appear in the Schedules tab */}
                    <section className="availability-summary">
                        <div className="availability-summary-card available-card">
                            <span className="summary-label">
                                Available schedules
                            </span>
                            <strong>{availableSchedules.length}</strong>
                            <small>Open for booking</small>
                        </div>

                        <div className="availability-summary-card unavailable-card">
                            <span className="summary-label">
                                Unavailable schedules
                            </span>
                            <strong>{unavailableSchedules.length}</strong>
                            <small>Marked unavailable</small>
                        </div>

                        <div className="availability-summary-card slots-card">
                            <span className="summary-label">
                                Available slots
                            </span>
                            <strong>{availableSlots}</strong>
                            <small>Currently bookable</small>
                        </div>

                        <div className="availability-summary-card total-card">
                            <span className="summary-label">
                                Total slots
                            </span>
                            <strong>{totalSlots}</strong>
                            <small>Across all schedules</small>
                        </div>
                    </section>

                    <section className="existing-availability">
                        <div className="existing-availability-heading">
                            <div>
                                <h2>Your Schedules</h2>
                                <p>
                                    Review your availability and slot status.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="refresh-availability-button"
                                onClick={() => void loadAvailabilities()}
                                disabled={loadingAvailabilities}
                            >
                                {loadingAvailabilities
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>
                        </div>

                        {loadingAvailabilities && (
                            <p>Loading availability...</p>
                        )}

                        {availabilityLoadError && (
                            <p
                                className="availability-error"
                                role="alert"
                            >
                                {availabilityLoadError}
                            </p>
                        )}

                        {!loadingAvailabilities &&
                            !availabilityLoadError &&
                            availabilities.length === 0 && (
                                <div className="availability-empty-state">
                                    <h3>No schedules yet</h3>
                                    <p>
                                        Add availability to let patients book
                                        appointments.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab("manage");
                                            setActivePanel("add");
                                            setMessage("");
                                            setError("");
                                        }}
                                    >
                                        Add your first schedule
                                    </button>
                                </div>
                            )}

                        {!loadingAvailabilities &&
                            availabilities.map((item) => (
                                <article
                                    className="availability-record"
                                    key={item.id}
                                >
                                    <div className="availability-record-details">
                                        <h3>
                                            {formatDisplayDate(
                                                item.availability_date
                                            )}
                                        </h3>

                                        <p>
                                            {formatTime(item.start_time)} –{" "}
                                            {formatTime(item.end_time)}
                                        </p>

                                        <p>
                                            {item.available_slots} available /{" "}
                                            {item.total_slots} total slots
                                        </p>

                                        <small>
                                            {item.blocked_slots} blocked slots
                                        </small>
                                    </div>

                                    <span
                                        className={`availability-status ${item.status}`}
                                    >
                                        <span className="status-dot" />
                                        {item.status === "available"
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>
                                </article>
                            ))}
                    </section>
                </section>
            )}
        </div>
    );
}

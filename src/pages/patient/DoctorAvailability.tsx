
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

import "./DoctorAvailability.css";

interface DoctorSlot {
    slotId: string;
    startTime: string;
    endTime: string;
    status: "available" | "booked" | "unavailable";
}

export default function DoctorAvailability() {

    const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
    const [bookingMessage, setBookingMessage] = useState("");
    const [bookingError, setBookingError] = useState("");

    const { doctorId } = useParams<{ doctorId: string }>();

    const [today] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    });

    const [slots, setSlots] = useState<DoctorSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [date, setDate] = useState(today);

    useEffect(() => {
        if (!doctorId || !date) return;

        setLoading(true);
        setError("");

        apiRequest(`/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`)
            .then((result) => {
                setSlots(result.data);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load available slots.");
                setSlots([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [doctorId, date]);

    const handleBookAppointment = async (slotId: string) => {
        if (!doctorId) return;

        setBookingSlotId(slotId);
        setBookingMessage("");
        setBookingError("");

        try {
            const result = await apiRequest("/appointments", {
                method: "POST",
                body: JSON.stringify({
                    doctorId,
                    slotId,
                }),
            });

            const appointment = result.data;

            setBookingMessage(
                `Appointment booked successfully! Doctor fee: ₹${Number(
                    appointment.doctorFee
                ).toFixed(2)}, other charges: ₹${Number(
                    appointment.commissionFee
                ).toFixed(2)}, total: ₹${Number(
                    appointment.totalFee
                ).toFixed(2)}.`
            );

            const slotsResult = await apiRequest(
                `/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`
            );

            setSlots(slotsResult.data);
        } catch (err: unknown) {
            setBookingError(
                err instanceof Error
                    ? err.message
                    : "Failed to book the appointment."
            );
        } finally {
            setBookingSlotId(null);
        }
    };


    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });
    };


    return (
        <div className="doctor-availability-page">
            <div className="availability-heading">
                <h2>Doctor Availability</h2>
                <p>Select a date to view available appointment slots.</p>
            </div>

            {bookingMessage && (
                <p className="booking-success" role="status">
                    {bookingMessage}
                </p>
            )}

            {bookingError && (
                <p className="availability-error" role="alert">
                    {bookingError}
                </p>
            )}

            <div className="availability-date">
                <label htmlFor="appointment-date">
                    Appointment date
                </label>

                <input
                    id="appointment-date"
                    type="date"
                    value={date}
                    min={today}
                    onChange={(event) => setDate(event.target.value)}
                />
            </div>

            {loading && <p>Loading appointment slots...</p>}

            {error && <p className="availability-error" role="alert">{error}</p>}

            {!loading && !error && slots.length === 0 && (
                <p>No slots are available for this date.</p>
            )}

            {!loading && !error && slots.length > 0 && (
                <div className="availability-slot-list">
                    {slots.map((slot) => (
                        <div className="availability-slot" key={slot.slotId}>
                            <div>
                                <strong>{formatTime(slot.startTime)} –{" "}{formatTime(slot.endTime)}</strong>

                                <p className={`slot-status ${slot.status}`}>
                                    {slot.status === "available" ? "Available" : slot.status === "booked" ? "Booked" : "Unavailable"}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={slot.status !== "available" || bookingSlotId !== null}
                                onClick={() => handleBookAppointment(slot.slotId)}
                            >
                                {bookingSlotId === slot.slotId ? "Booking..." : "Select Slot"}
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

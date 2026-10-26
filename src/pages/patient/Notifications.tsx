
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Notifications.css";

interface Notification {
    id: string;
    appointmentId: string | null;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        apiRequest("/notifications")
            .then((result) => {
                setNotifications(result.data);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load notifications.");
            })
            .finally(() => setLoading(false));
    }, []);

    const markAsRead = async (notificationId: string) => {
        setError("");
        setUpdatingId(notificationId);

        try {
            await apiRequest(`/notifications/${notificationId}/read`, {
                method: "PATCH",
            });

            window.dispatchEvent(new Event("notifications-updated"));

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to mark notification as read.");
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div>
                    <h2>Notifications</h2>
                    <p>Stay updated about your appointments and reminders.</p>
                </div>

                {!loading && (
                    <span className="unread-count">
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {loading && (
                <p className="notifications-message">
                    Loading notifications...
                </p>
            )}

            {error && (
                <p className="notifications-error" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && notifications.length === 0 && (
                <div className="notifications-empty">
                    <h3>You're all caught up!</h3>
                    <p>Your notifications will appear here.</p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <article
                            className={`notification-card ${notification.isRead ? "is-read" : "is-unread"
                                }`}
                            key={notification.id}
                        >
                            <div className="notification-card-content">
                                <div className="notification-title-row">
                                    <h3>{notification.title}</h3>

                                    {!notification.isRead && (
                                        <span className="unread-dot" />
                                    )}
                                </div>

                                <p className="notification-message">
                                    {notification.message}
                                </p>

                                <p className="notification-date">
                                    {formatDate(notification.createdAt)}
                                </p>

                                {notification.appointmentId && (
                                    <p className="notification-appointment">
                                        Appointment ID: #
                                        {notification.appointmentId}
                                    </p>
                                )}
                            </div>

                            {!notification.isRead && (
                                <button
                                    type="button"
                                    className="mark-read-button"
                                    onClick={() => markAsRead(notification.id)}
                                    disabled={updatingId !== null}
                                >
                                    {updatingId === notification.id
                                        ? "Updating..."
                                        : "Mark as read"}
                                </button>
                            )}

                            {notification.isRead && (
                                <span className="read-label">Read</span>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

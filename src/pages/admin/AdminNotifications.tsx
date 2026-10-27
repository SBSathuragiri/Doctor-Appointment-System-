
import { useEffect, useMemo, useState } from "react";
import "./AdminNotifications.css";

type NotificationStatus = "unread" | "read";
type NotificationType = "appointment" | "doctor" | "system";

interface ApiNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    isRead: boolean;
}

interface AdminNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    createdAt: string;
    status: NotificationStatus;
}

const API_URL = "http://localhost:5000/api/notifications";

const mapNotification = (
    notification: ApiNotification
): AdminNotification => ({
    id: String(notification.id),
    title: notification.title,
    message: notification.message,
    type: notification.type.toLowerCase().includes("doctor")
        ? "doctor"
        : notification.type.toLowerCase().includes("appointment")
            ? "appointment"
            : "system",
    createdAt: notification.createdAt,
    status: notification.isRead ? "read" : "unread",
});

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingIds, setUpdatingIds] = useState<string[]>([]);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/admin`, {
                credentials: "include",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load notifications."
                );
            }

            setNotifications(
                (result.data as ApiNotification[]).map(mapNotification)
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(
        (notification) => notification.status === "unread"
    ).length;

    const filteredNotifications = useMemo(() => {
        if (filter === "all") return notifications;

        return notifications.filter(
            (notification) => notification.status === filter
        );
    }, [notifications, filter]);

    const markAsRead = async (id: string) => {
        setError("");
        setUpdatingIds((current) => [...current, id]);

        try {
            const response = await fetch(`${API_URL}/${id}/read`, {
                method: "PATCH",
                credentials: "include",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to mark notification as read."
                );
            }

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? { ...notification, status: "read" }
                        : notification
                )
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update notification."
            );
        } finally {
            setUpdatingIds((current) =>
                current.filter((notificationId) => notificationId !== id)
            );
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(
            (notification) => notification.status === "unread"
        );

        if (unreadNotifications.length === 0) return;

        setMarkingAll(true);
        setError("");

        try {
            // Use the existing API for each unread notification.
            const results = await Promise.allSettled(
                unreadNotifications.map(async (notification) => {
                    const response = await fetch(
                        `${API_URL}/${notification.id}/read`,
                        {
                            method: "PATCH",
                            credentials: "include",
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            result.message ||
                            `Failed to update notification ${notification.id}.`
                        );
                    }

                    return notification.id;
                })
            );

            const successfulIds = new Set(
                results
                    .filter(
                        (
                            result
                        ): result is PromiseFulfilledResult<string> =>
                            result.status === "fulfilled"
                    )
                    .map((result) => result.value)
            );

            setNotifications((current) =>
                current.map((notification) =>
                    successfulIds.has(notification.id)
                        ? { ...notification, status: "read" }
                        : notification
                )
            );

            if (results.some((result) => result.status === "rejected")) {
                setError(
                    "Some notifications could not be marked as read. Please try again."
                );
            }
        } finally {
            setMarkingAll(false);
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

    return (
        <div className="admin-notifications">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    <p>Stay updated on activity across Care Point.</p>
                </div>

                <button
                    className="mark-all-button"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0 || markingAll}
                >
                    {markingAll ? "Updating..." : "Mark all as read"}
                </button>
            </div>

            <div className="notification-summary">
                <div className="notification-summary-card">
                    <span>Total notifications</span>
                    <strong>{notifications.length}</strong>
                </div>

                <div className="notification-summary-card">
                    <span>Unread notifications</span>
                    <strong>{unreadCount}</strong>
                </div>
            </div>

            {error && (
                <p role="alert" className="notification-error">
                    {error}
                </p>
            )}

            <div className="notification-toolbar">
                <h2>Recent activity</h2>

                <select
                    aria-label="Filter notifications"
                    value={filter}
                    onChange={(event) =>
                        setFilter(event.target.value as typeof filter)
                    }
                >
                    <option value="all">All notifications</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                </select>
            </div>

            <div className="notification-list">
                {loading ? (
                    <div className="notification-empty">
                        <p>Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="notification-empty">
                        <span className="notification-empty-icon">♧</span>
                        <h3>No notifications</h3>
                        <p>
                            {notifications.length === 0
                                ? "Notifications for this admin account will appear here."
                                : "There are no notifications in this category."}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <article
                            key={notification.id}
                            className={`notification-card ${notification.status === "unread"
                                    ? "notification-unread"
                                    : ""
                                }`}
                        >
                            <div
                                className={`notification-icon notification-icon-${notification.type}`}
                            >
                                {notification.type === "doctor"
                                    ? "♙"
                                    : notification.type === "appointment"
                                        ? "▦"
                                        : "⚙"}
                            </div>

                            <div className="notification-details">
                                <div className="notification-title-row">
                                    <h3>{notification.title}</h3>

                                    {notification.status === "unread" && (
                                        <span className="unread-badge">
                                            Unread
                                        </span>
                                    )}
                                </div>

                                <p>{notification.message}</p>

                                <time dateTime={notification.createdAt}>
                                    {formatDate(notification.createdAt)}
                                </time>
                            </div>

                            {notification.status === "unread" && (
                                <button
                                    className="mark-read-button"
                                    onClick={() =>
                                        void markAsRead(notification.id)
                                    }
                                    disabled={updatingIds.includes(
                                        notification.id
                                    )}
                                >
                                    {updatingIds.includes(notification.id)
                                        ? "Updating..."
                                        : "Mark as read"}
                                </button>
                            )}
                        </article>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;

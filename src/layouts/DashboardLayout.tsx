
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
    title: string;
    menuItems: {
        label: string;
        path: string;
    }[];
    children: ReactNode;
}

interface Notification {
    id: string;
    isRead: boolean;
}

export default function DashboardLayout({
    title,
    menuItems,
    children,
}: DashboardLayoutProps) {

    const navigate = useNavigate();
    const location = useLocation();

    const [unreadCount, setUnreadCount] = useState(0);
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const notificationsPath = menuItems.find((item) =>
        item.label.toLowerCase().includes("notification")
    )?.path;

    useEffect(() => {
        const loadUnreadCount = async () => {
            try {

                const result = await apiRequest("/notifications");
                const notifications: Notification[] = result.data;
                setUnreadCount(notifications.filter((notification) => !notification.isRead).length);

            } catch (error: unknown) {
                console.error("Failed to load notification count:", error);
            }
        };

        loadUnreadCount();

        window.addEventListener("notifications-updated", loadUnreadCount);

        return () => {
            window.removeEventListener("notifications-updated", loadUnreadCount);
        };
    }, [location.pathname]);

    const handleLogout = async () => {
        setLoggingOut(true);
        setLogoutError("");

        try {
            await apiRequest("/auth/logout", {
                method: "POST",
            });

            navigate("/login", { replace: true });
        } catch (error: unknown) {
            setLogoutError(
                error instanceof Error ? error.message : "Failed to log out. Please try again.");
            setLoggingOut(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-top">
                    <h2>CarePoint</h2>
                    <p className="sidebar-subtitle">{title}</p>

                    <nav>
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive
                                        ? "menu-link active"
                                        : "menu-link"
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    {logoutError && (
                        <p className="logout-error" role="alert">
                            {logoutError}
                        </p>
                    )}

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        <span aria-hidden="true">↪</span>
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>{title}</h1>

                    <button
                        type="button"
                        className="header-notification-button"
                        onClick={() => {
                            if (notificationsPath) {
                                navigate(notificationsPath);
                            }
                        }}
                        disabled={!notificationsPath}
                        aria-label={`Notifications, ${unreadCount} unread`}
                        title={
                            notificationsPath
                                ? "View notifications"
                                : "Notifications page is not configured for this dashboard"
                        }
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                            <path d="M10 21h4" />
                        </svg>

                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>
                </header>

                <section className="dashboard-content">
                    {children}
                </section>
            </main>
        </div>
    );
}

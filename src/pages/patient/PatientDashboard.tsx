
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { getCurrentUser, type AuthUser } from "../../services/auth";
import "./PatientDashboard.css";

interface PatientStats {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
}

export default function PatientDashboard() {
    const [stats, setStats] = useState<PatientStats | null>(null);
    const [error, setError] = useState("");
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch(() => {
                setError("Failed to load your profile.");
            });

        apiRequest("/appointments/my/dashboard/stats")
            .then((result) => setStats(result.data))
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Failed to load dashboard statistics.");
            });
    }, []);

    return (
        <>
            <div className="patient-welcome">
                <h2>Welcome back{user ? `, ${user.name}` : ""}!</h2>
                <p>Manage your appointments and health information.</p>
            </div>

            {error && <p role="alert">{error}</p>}

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Appointments</h3>
                    <p>{stats ? stats.totalAppointments : "Loading..."}</p>
                </div>

                <div className="stat-card">
                    <h3>Upcoming Appointments</h3>
                    <p>{stats ? stats.upcomingAppointments : "Loading..."}</p>
                </div>

                <div className="stat-card">
                    <h3>Completed Appointments</h3>
                    <p>{stats ? stats.completedAppointments : "Loading..."}</p>
                </div>
            </div>
        </>
    );
}

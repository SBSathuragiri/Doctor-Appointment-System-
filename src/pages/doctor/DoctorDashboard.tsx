
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import './DoctorDashboard.css'

interface DoctorStats {
    totalAppointments: number;
    todayAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
}

export default function DoctorDashboard() {
    const [stats, setStats] = useState<DoctorStats>({
        totalAppointments: 0,
        todayAppointments: 0,
        completedAppointments: 0,
        upcomingAppointments: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/appointments/doctor/dashboard/stats")
            .then((result) => {
                setStats(result.data);
            })
            .catch((err: unknown) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load dashboard statistics."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    const statCards = [
        {
            label: "Total Appointments",
            value: stats.totalAppointments,
        },
        {
            label: "Today's Appointments",
            value: stats.todayAppointments,
        },
        {
            label: "Completed Appointments",
            value: stats.completedAppointments,
        },
        {
            label: "Upcoming Appointments",
            value: stats.upcomingAppointments,
        },
    ];

    return (
        <div className="doctor-dashboard">
            <div className="dashboard-welcome">
                <h2>Welcome back, Doctor!</h2>
                <p>Here is a summary of your appointments.</p>
            </div>

            <div className="dashboard-stats-grid">
                {statCards.map((card) => (
                    <div className="dashboard-stat-card" key={card.label}>
                        <p>{card.label}</p>
                        <h3>{card.value || 0}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}

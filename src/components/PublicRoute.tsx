
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { apiRequest } from "../services/api";

interface PublicRouteProps {
    children: ReactNode;
}

type UserRole = "patient" | "doctor" | "admin";

interface AuthResponse {
    data: {
        role: UserRole;
    };
}

const dashboardByRole: Record<UserRole, string> = {
    patient: "/patient/dashboard",
    doctor: "/doctor/dashboard",
    admin: "/admin/dashboard",
};

const PublicRoute = ({ children }: PublicRouteProps) => {
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const checkAuth = async () => {
            try {
                const response = await apiRequest("/auth/me");

                console.log("PublicRoute /auth/me response:", response);
                console.log("Current user role:", response.data?.role);

                const authResponse = response as AuthResponse;
                const role = authResponse.data.role;

                const destination = dashboardByRole[role];

                if (!destination) {
                    throw new Error("Invalid user role");
                }

                if (active) {
                    setDashboard(destination);
                }
            } catch {
                if (active) {
                    setDashboard(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <div>Checking authentication...</div>;
    }

    if (dashboard) {
        return <Navigate to={dashboard} replace />;
    }

    return children;
};

export default PublicRoute;

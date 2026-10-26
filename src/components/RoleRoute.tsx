
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import type { AuthUser } from "../services/auth";

interface RoleRouteContext {
    user: AuthUser;
}

interface RoleRouteProps {
    allowedRole: AuthUser["role"];
}

export default function RoleRoute({ allowedRole }: RoleRouteProps) {
    const { user } = useOutletContext<RoleRouteContext>();

    if (user.role !== allowedRole) {
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (user.role === "doctor") {
            return <Navigate to="/doctor/dashboard" replace />;
        }

        return <Navigate to="/patient/dashboard" replace />;
    }

    return <Outlet />;
}

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, type AuthUser } from "../services/auth";

export default function ProtectedRoute() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p>Checking login...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet context={{ user }} />;
}
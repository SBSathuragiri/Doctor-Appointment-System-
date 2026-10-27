import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function AdminLayout() {
    const menuItems = [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Doctors", path: "/admin/doctors" },
        { label: "Patients", path: "/admin/patients" },
        { label: "Appointments", path: "/admin/appointments" },
        { label: "Settings", path: "/admin/settings" },
    ];

    return (
        <DashboardLayout
            title="Admin Dashboard"
            menuItems={menuItems}
        >
            <Outlet />
        </DashboardLayout>
    );
}
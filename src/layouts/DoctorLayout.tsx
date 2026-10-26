
import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function DoctorLayout() {
    const menuItems = [
        { label: "Dashboard", path: "/doctor/dashboard" },
        { label: "Availability", path: "/doctor/availability" },
        { label: "Appointment", path: "/doctor/appointment" },
        { label: "Notifications", path: "/doctor/notifications" },
    ];

    return (
        <DashboardLayout
            title="Doctor Dashboard"
            menuItems={menuItems}
        >
            <Outlet />
        </DashboardLayout>
    );
}

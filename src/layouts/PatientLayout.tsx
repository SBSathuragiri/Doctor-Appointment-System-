
import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

export default function PatientLayout() {
    const menuItems = [
        { label: "Dashboard", path: "/patient/dashboard" },
        { label: "Find Doctors", path: "/patient/doctors" },
        { label: "My Appointments", path: "/patient/appointments" },
        { label: "Prescriptions", path: "/patient/prescriptions" },
        { label: "Notifications", path: "/patient/notifications" },
    ];

    return (
        <DashboardLayout
            title="Patient Dashboard"
            menuItems={menuItems}
        >
            <Outlet />
        </DashboardLayout>
    );
}

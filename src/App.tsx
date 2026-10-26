
import { BrowserRouter, Navigate, Route, Routes, } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import FindDoctors from "./pages/patient/FindDoctors";
import PatientLayout from "./layouts/PatientLayout";
import DoctorsAvailability from "./pages/patient/DoctorAvailability";
import MyAppointments from "./pages/patient/MyAppointments";
import Prescriptions from "./pages/patient/Prescriptions";
import Notifications from "./pages/patient/Notifications";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorAvailability from "./pages/doctor/DoctorsAvailability";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>

          <Route element={<RoleRoute allowedRole="patient" />}>
            <Route element={<PatientLayout />} >
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/doctors" element={<FindDoctors />} />
              <Route path="/patient/doctors/:doctorId/availability" element={<DoctorsAvailability />} />
              <Route path="/patient/appointments/" element={<MyAppointments />} />
              <Route path="/patient/prescriptions/" element={<Prescriptions />} />
              <Route path="/patient/notifications/" element={<Notifications />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRole="doctor" />}>
            <Route element={<DoctorLayout />} >
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointment" element={<DoctorAppointments />} />
              <Route path="/doctor/notifications" element={<Notifications />} />
              <Route path="/doctor/availability" element={<DoctorAvailability />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

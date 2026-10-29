
export interface AdminDashboardStats {
    totalPatients: number;
    approvedDoctors: number;
    pendingDoctors: number;
    totalAppointments: number;
    activeAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/dashboard/stats`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to load dashboard statistics");
    }

    return result.data;
};


export interface PendingDoctor {
    doctor_id: string;
    name: string;
    email: string;
    specialization: string;
    qualification: string;
    bio: string | null;
    consultation_fee: number | string;
    approval_status: string;
    certificate_id: string | null;
    certificate_doctor_name: string | null;
    certificate_specialization: string | null;
    certificate_path: string | null;
    certificate_review_status: string | null;
    applied_at: string | null;
}

export const getPendingDoctors = async (): Promise<PendingDoctor[]> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/doctors/pending`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to load pending doctors");
    }

    return result.data;
};

export const reviewDoctorApplication = async (
    doctorId: string,
    decision: "approved" | "rejected"
) => {
    const response = await fetch(
        `${API_BASE_URL}/admin/doctors/${doctorId}/review`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ decision }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to review doctor application");
    }

    return result.data;
};

export const reviewDoctorCertificate = async (
    certificateId: string,
    decision: "approved" | "rejected"
) => {
    const response = await fetch(
        `${API_BASE_URL}/admin/doctors/certificates/${certificateId}/review`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ decision }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to review certificate");
    }

    return result.data;
};

export const getDoctorCertificateUrl = async (
    certificateId: string
): Promise<string> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/doctors/certificates/${certificateId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to open certificate");
    }

    return result.data.signedUrl;
};


export interface AdminPatient {
    patient_id: string;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export const getAdminPatients = async (): Promise<AdminPatient[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/patients`, {
        method: "GET",
        credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to load patients");
    }

    return result.data;
};

export interface AdminAppointment {
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    specialization: string | null;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    doctorFee: string;
    commissionFee: string;
    totalFee: string;
    status: string;
    bookedAt: string;
}

export const getAdminAppointments = async (): Promise<AdminAppointment[]> => {
    const response = await fetch(
        `${API_BASE_URL}/appointments/admin`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to load appointments"
        );
    }

    return result.data;
};

export interface CommissionSettings {
    mode: "fixed" | "percentage";
    value: number;
}

export const getCommissionSettings = async (): Promise<CommissionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/settings/commission`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to load commission settings");
    }

    return result.data;
};

export const updateCommissionSettings = async (
    settings: CommissionSettings
): Promise<CommissionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/settings/commission`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to update commission settings");
    }

    const saved = result.data.setting_value ?? result.data;

    return {
        mode: saved.mode,
        value: Number(saved.value),
    };
};

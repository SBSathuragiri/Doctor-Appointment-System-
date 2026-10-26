
import { apiRequest } from "./api";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "patient" | "doctor" | "admin";
}

export async function getCurrentUser(): Promise<AuthUser> {
    const result = await apiRequest("/auth/me");
    return result.data;
}

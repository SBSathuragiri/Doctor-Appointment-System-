
const API_BASE_URL = "import.meta.env.VITE_API_URL;";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {
    const headers = new Headers(options.headers);

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed with status ${response.status}`
        );
    }

    return data;
}

const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

interface User {
  name: string;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<User> {
  return fetchWithAuth<User>("/auth/me");
}

export interface UpdateProfileData {
  name: string;
  email: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<User> {
  return fetchWithAuth<User>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

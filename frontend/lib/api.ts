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

// Events
export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
  imageUrl?: string;
  createdBy: { name: string; email?: string } | string;
  remainingSeats: number;
}

export interface EventsResponse {
  events: EventItem[];
  total: number;
  page: number;
  totalPages?: number;
  limit?: number;
}

export async function getPublicEvents(
  page = 1,
  limit = 10,
): Promise<EventsResponse> {
  return fetchWithAuth<EventsResponse>(`/events?page=${page}&limit=${limit}`);
}

export async function getAdminEvents(
  page = 1,
  limit = 10,
): Promise<EventsResponse> {
  return fetchWithAuth<EventsResponse>(
    `/events/admin?page=${page}&limit=${limit}`,
  );
}

// Reservations
export interface Reservation {
  _id: string;
  event: string | EventItem;
  status: string;
  createdAt: string;
}

export async function getMyReservations(
  status?: string,
): Promise<Reservation[]> {
  const query = status ? `?status=${status}` : "";
  return fetchWithAuth<Reservation[]>(`/reservations/me${query}`);
}

export async function createReservation(eventId: string): Promise<Reservation> {
  return fetchWithAuth<Reservation>("/reservations", {
    method: "POST",
    body: JSON.stringify({ eventId }),
  });
}

export async function cancelReservation(id: string): Promise<Reservation> {
  return fetchWithAuth<Reservation>(`/reservations/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function downloadTicket(reservationId: string): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(
    `${API_URL}/reservations/${reservationId}/ticket`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) throw new Error("Erreur lors du téléchargement du ticket");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ticket-${reservationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

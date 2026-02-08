"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ReserveButton from "@/components/ReserveButton";
import UserDropdown from "@/components/UserDropdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUser();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {}
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log("Events loaded:", data.events);
      setEvents(data.events || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/reservations")}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Mes réservations
            </button>
            <UserDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun événement disponible
            </h2>
            <p className="text-gray-500">
              Revenez plus tard pour découvrir de nouveaux événements
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                {event.imageUrl && (
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {event.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">
                        {event.remainingSeats > 0 ? (
                          <span className="text-green-600">
                            {event.remainingSeats} places restantes
                          </span>
                        ) : (
                          <span className="text-red-600">Complet</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <ReserveButton
                    eventId={event._id || event.id}
                    disabled={event.remainingSeats === 0}
                    remainingSeats={event.remainingSeats}
                    onSuccess={fetchEvents}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all disabled:from-gray-400 disabled:to-gray-400 shadow-md hover:shadow-lg"
                  >
                    {event.remainingSeats === 0
                      ? "Complet"
                      : "Réserver ma place"}
                  </ReserveButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

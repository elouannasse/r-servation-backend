"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchReservations();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching user reservations...");
      const res = await fetch(`${API_URL}/reservations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("User reservations:", data);
      setReservations(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette réservation ?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Réservation annulée");
      fetchReservations();
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: {
        icon: Clock,
        text: "En attente de confirmation",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      CONFIRMED: {
        icon: CheckCircle,
        text: "Confirmée",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      REFUSED: {
        icon: XCircle,
        text: "Refusée",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      CANCELED: {
        icon: AlertCircle,
        text: "Annulée",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    const {
      icon: Icon,
      text,
      className,
    } = config[status as keyof typeof config];

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${className}`}
      >
        <Icon className="w-4 h-4" />
        <span className="font-semibold text-sm">{text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
          <button
            onClick={() => router.push("/events")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Voir les événements
          </button>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Aucune réservation
            </h2>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore réservé d'événement
            </p>
            <button
              onClick={() => router.push("/events")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Découvrir les événements
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {reservation.event?.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>
                          {new Date(reservation.event?.date).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{reservation.event?.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {getStatusBadge(reservation.status)}
                  </div>
                </div>

                {reservation.status === "PENDING" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCancel(reservation._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Annuler la réservation
                    </button>
                  </div>
                )}

                {reservation.status === "CONFIRMED" && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={async () => {
                        const { generateTicketPDF } =
                          await import("@/lib/generateTicketPDF");
                        await generateTicketPDF({
                          reservationId: reservation._id,
                          eventTitle: reservation.event?.title || "Événement",
                          eventDate: reservation.event?.date || "",
                          eventLocation: reservation.event?.location || "",
                          userName:
                            user?.name ||
                            reservation.user?.name ||
                            "Participant",
                          userEmail:
                            user?.email || reservation.user?.email || "",
                          status: reservation.status,
                        });
                        toast.success("Billet téléchargé !");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger le billet
                    </button>
                    <button
                      onClick={() => handleCancel(reservation._id)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

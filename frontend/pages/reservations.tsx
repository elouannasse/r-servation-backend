import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import {
  getMyReservations,
  cancelReservation,
  downloadTicket,
  Reservation,
  EventItem,
} from "../lib/api";
import Loader from "../components/Loader";

export default function ReservationsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/reservations");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch reservations
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getMyReservations();
        setReservations(data);
      } catch {
        setError("Impossible de charger vos réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated]);

  const handleCancel = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?"))
      return;

    try {
      setCancellingId(id);
      const updated = await cancelReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: updated.status } : r)),
      );
    } catch {
      setError("Erreur lors de l'annulation de la réservation.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadTicket = async (id: string) => {
    try {
      setDownloadingId(id);
      await downloadTicket(id);
    } catch {
      setError("Erreur lors du téléchargement du ticket.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading || (!isAuthenticated && !error)) {
    return <Loader fullPage text="Chargement..." />;
  }

  const filteredReservations =
    filterStatus === "all"
      ? reservations
      : reservations.filter(
          (r) => r.status.toUpperCase() === filterStatus.toUpperCase(),
        );

  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    PENDING: {
      label: "En attente",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    CONFIRMED: {
      label: "Confirmée",
      bg: "bg-green-100",
      text: "text-green-800",
    },
    REFUSED: { label: "Refusée", bg: "bg-red-100", text: "text-red-800" },
    CANCELED: { label: "Annulée", bg: "bg-gray-100", text: "text-gray-600" },
  };

  const getStatusBadge = (status: string) => {
    const key = status.toUpperCase();
    const cfg = statusConfig[key] || {
      label: status,
      bg: "bg-gray-100",
      text: "text-gray-800",
    };
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label}
      </span>
    );
  };

  const canCancel = (status: string) => {
    const s = status.toUpperCase();
    return s === "PENDING" || s === "CONFIRMED";
  };

  const canDownload = (status: string) => {
    return status.toUpperCase() === "CONFIRMED";
  };

  const getEventData = (event: string | EventItem): EventItem | null => {
    return typeof event === "object" ? event : null;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Mes réservations
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Bienvenue {user?.name}, retrouvez toutes vos réservations ci-dessous.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white cursor-pointer sm:w-52"
        >
          <option value="all">Toutes les réservations</option>
          <option value="CONFIRMED">Confirmées</option>
          <option value="PENDING">En attente</option>
          <option value="REFUSED">Refusées</option>
          <option value="CANCELED">Annulées</option>
        </select>

        <span className="text-sm text-gray-500">
          {filteredReservations.length} réservation
          {filteredReservations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800 ml-4 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {loading ? (
        <Loader fullPage text="Chargement des réservations..." />
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500 text-lg">Aucune réservation</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterStatus !== "all"
              ? "Aucune réservation avec ce statut."
              : "Vous n'avez pas encore de réservation."}
          </p>
          <Link
            href="/events"
            className="inline-block mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Découvrir les événements
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const event = getEventData(reservation.event);
            const isCancelling = cancellingId === reservation._id;
            const isDownloading = downloadingId === reservation._id;

            return (
              <div
                key={reservation._id}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4">
                  {/* Top row: title + badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {event?.title || "Événement"}
                      </h2>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
                    {event?.date && (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {format(new Date(event.date), "dd MMM yyyy à HH:mm", {
                          locale: fr,
                        })}
                      </span>
                    )}
                    {event?.location && (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Réservé le{" "}
                      {format(new Date(reservation.createdAt), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    {event && (
                      <Link
                        href={`/events/${event.id}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Voir l&apos;événement
                      </Link>
                    )}

                    {canDownload(reservation.status) && (
                      <button
                        onClick={() => handleDownloadTicket(reservation._id)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                        Télécharger ticket
                      </button>
                    )}

                    {canCancel(reservation.status) && (
                      <button
                        onClick={() => handleCancel(reservation._id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isCancelling ? (
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

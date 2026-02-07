import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { EventItem, createReservation, getMyReservations } from "../../lib/api";
import Button from "../../components/ui/Button";
import Loader, { ButtonSpinner } from "../../components/Loader";

interface EventDetailProps {
  event: EventItem | null;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<EventDetailProps> = async (
  context,
) => {
  const { id } = context.params as { id: string };
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  try {
    const res = await fetch(`${API_URL}/events/${id}`);

    if (!res.ok) {
      if (res.status === 404) {
        return { notFound: true };
      }
      throw new Error("Erreur serveur");
    }

    const event = await res.json();
    return { props: { event } };
  } catch {
    return { props: { event: null, error: "Impossible de charger l'événement." } };
  }
};

export default function EventDetail({ event, error }: EventDetailProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [alreadyReserved, setAlreadyReserved] = useState(false);
  const [checkingReservation, setCheckingReservation] = useState(false);
  const [reserving, setReserving] = useState(false);

  const isParticipant = user?.role === "participant";

  // Check if user already reserved this event
  useEffect(() => {
    if (!isAuthenticated || !event || !isParticipant) return;

    async function checkReservation() {
      setCheckingReservation(true);
      try {
        const reservations = await getMyReservations();
        const found = reservations.some((r) => {
          const eventId =
            typeof r.event === "string" ? r.event : r.event?.id;
          return eventId === event!.id && r.status !== "CANCELED";
        });
        setAlreadyReserved(found);
      } catch {
        // Silently fail — just won't show "already reserved"
      } finally {
        setCheckingReservation(false);
      }
    }

    checkReservation();
  }, [isAuthenticated, event, isParticipant]);

  const handleReserve = async () => {
    if (!event) return;
    setReserving(true);
    try {
      await createReservation(event.id);
      toast.success("Réservation effectuée avec succès !");
      setAlreadyReserved(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la réservation";
      toast.error(message);
    } finally {
      setReserving(false);
    }
  };

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-lg mb-4">{error || "Événement introuvable"}</p>
        <Link href="/events" className="text-blue-600 hover:underline font-medium">
          ← Retour aux événements
        </Link>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      return format(new Date(event.date), "EEEE d MMMM yyyy · HH:mm", { locale: fr });
    } catch {
      return event.date;
    }
  })();

  const seatsPercent =
    event.capacity > 0
      ? Math.round((event.remainingSeats / event.capacity) * 100)
      : 0;

  const seatsColor =
    seatsPercent > 50
      ? "text-green-600 bg-green-50"
      : seatsPercent > 20
        ? "text-yellow-600 bg-yellow-50"
        : "text-red-600 bg-red-50";

  const createdByName =
    typeof event.createdBy === "string" ? event.createdBy : event.createdBy?.name;

  const imageUrl = event.imageUrl
    ? event.imageUrl.startsWith("http")
      ? event.imageUrl
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/${event.imageUrl}`
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link href="/events" className="text-sm text-blue-600 hover:underline font-medium">
          ← Retour aux événements
        </Link>
      </nav>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Hero image */}
        <div className="relative h-56 sm:h-72 md:h-96 bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <svg className="w-20 h-20 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Status badge (non-published) */}
          {event.status !== "PUBLISHED" && (
            <span
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                event.status === "CANCELED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {event.status}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:gap-10">
            {/* Left: Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm md:text-base capitalize">{formattedDate}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm md:text-base">{event.location}</span>
                </div>

                {createdByName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm md:text-base">Organisé par {createdByName}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Right: Reservation card */}
            <div className="lg:w-80 shrink-0">
              <div className="sticky top-24 bg-gray-50 rounded-xl border border-gray-200 p-5 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Réservation
                </h3>

                {/* Capacity */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Capacité totale</span>
                    <span className="font-medium text-gray-900">{event.capacity} places</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Places restantes</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${seatsColor}`}>
                      {event.remainingSeats > 0 ? event.remainingSeats : "Complet"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        seatsPercent > 50
                          ? "bg-green-500"
                          : seatsPercent > 20
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${100 - seatsPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">
                    {event.capacity - event.remainingSeats} / {event.capacity} réservées
                  </p>
                </div>

                {/* CTA */}
                {authLoading || checkingReservation ? (
                  <Loader size="sm" />
                ) : !isAuthenticated ? (
                  <Button
                    onClick={() => router.push(`/login?redirect=/events/${event.id}`)}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter pour réserver
                  </Button>
                ) : alreadyReserved ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium w-full justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Déjà réservé
                    </div>
                    <Link
                      href="/reservations"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Voir mes réservations
                    </Link>
                  </div>
                ) : !isParticipant ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Seuls les participants peuvent réserver.
                  </p>
                ) : event.remainingSeats <= 0 ? (
                  <div className="text-center bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                    Complet — plus de places disponibles
                  </div>
                ) : (
                  <Button
                    onClick={handleReserve}
                    disabled={reserving}
                    className="w-full py-3 flex items-center justify-center"
                  >
                    {reserving && <ButtonSpinner />}
                    {reserving ? "Réservation..." : "Réserver ma place"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

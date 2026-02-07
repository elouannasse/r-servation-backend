import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { createReservation, EventItem } from "../../lib/api";

interface EventDetailProps {
  event: EventItem;
}

export default function EventDetailPage({ event }: EventDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleReservation = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setIsLoading(true);
    try {
      await createReservation(event.id);
      toast.success("Réservation créée ! En attente de confirmation.");
      router.push("/reservations");
    } catch {
      toast.error("Erreur : événement complet ou déjà réservé.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isParticipant = !isAdmin;

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-gray-200 rounded-xl overflow-hidden mb-8">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <svg
              className="w-16 h-16 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {format(new Date(event.date), "EEEE dd MMMM yyyy à HH:mm", {
                locale: fr,
              })}
            </span>
            <span className="flex items-center gap-1.5">
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
          </div>

          <div className="prose max-w-none">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {typeof event.createdBy === "object" && event.createdBy?.name && (
            <p className="mt-6 text-sm text-gray-500">
              Organisé par{" "}
              <span className="font-medium text-gray-700">
                {event.createdBy.name}
              </span>
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Places restantes</span>
              <span
                className={`text-lg font-bold ${event.remainingSeats === 0 ? "text-red-600" : event.remainingSeats <= 5 ? "text-orange-500" : "text-green-600"}`}
              >
                {event.remainingSeats} / {event.capacity}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className={`h-2 rounded-full ${event.remainingSeats === 0 ? "bg-red-500" : event.remainingSeats <= 5 ? "bg-orange-400" : "bg-green-500"}`}
                style={{
                  width: `${((event.capacity - event.remainingSeats) / event.capacity) * 100}%`,
                }}
              />
            </div>

            {/* CTA */}
            {!isAuthenticated ? (
              <Link
                href={`/login?redirect=/events/${event.id}`}
                className="block w-full text-center py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Se connecter pour réserver
              </Link>
            ) : isAdmin ? (
              <p className="text-center text-sm text-gray-500 py-3">
                Les administrateurs ne peuvent pas réserver.
              </p>
            ) : event.remainingSeats === 0 ? (
              <button
                disabled
                className="w-full py-3 px-4 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
              >
                Complet
              </button>
            ) : isParticipant ? (
              <button
                onClick={handleReservation}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
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
                    Réservation en cours...
                  </>
                ) : (
                  "Réserver ma place"
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<EventDetailProps> = async (
  context,
) => {
  const { id } = context.params as { id: string };
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  try {
    const res = await fetch(`${API_URL}/events/${id}`);
    if (!res.ok) return { notFound: true };
    const event = await res.json();
    return { props: { event } };
  } catch {
    return { notFound: true };
  }
};

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { getMyReservations, Reservation, EventItem } from '../lib/api';
import Loader from '../components/Loader';

export default function ReservationsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Route protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/reservations');
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
        setError('Impossible de charger vos réservations.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated]);

  if (authLoading || (!isAuthenticated && !error)) {
    return <Loader fullPage text="Chargement..." />;
  }

  const filteredReservations =
    filterStatus === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      confirmed: {
        label: 'Confirmée',
        classes: 'bg-green-100 text-green-800',
      },
      pending: {
        label: 'En attente',
        classes: 'bg-yellow-100 text-yellow-800',
      },
      cancelled: {
        label: 'Annulée',
        classes: 'bg-red-100 text-red-800',
      },
    };
    const badge = map[status] || {
      label: status,
      classes: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}
      >
        {badge.label}
      </span>
    );
  };

  const getEventData = (event: string | EventItem): EventItem | null => {
    return typeof event === 'object' ? event : null;
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
          <option value="confirmed">Confirmées</option>
          <option value="pending">En attente</option>
          <option value="cancelled">Annulées</option>
        </select>

        <span className="text-sm text-gray-500">
          {filteredReservations.length} réservation
          {filteredReservations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
          {error}
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
            {filterStatus !== 'all'
              ? 'Aucune réservation avec ce statut.'
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

            return (
              <div
                key={reservation._id}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {event?.title || 'Événement'}
                      </h2>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      {event?.date && (
                        <span className="flex items-center gap-1">
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
                          {format(new Date(event.date), 'dd MMM yyyy à HH:mm', {
                            locale: fr,
                          })}
                        </span>
                      )}
                      {event?.location && (
                        <span className="flex items-center gap-1">
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
                      )}
                      <span className="flex items-center gap-1">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Réservé le{' '}
                        {format(
                          new Date(reservation.createdAt),
                          'dd MMM yyyy',
                          { locale: fr },
                        )}
                      </span>
                    </div>
                  </div>

                  {event && (
                    <Link
                      href={`/events/${event.id}`}
                      className="shrink-0 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
                    >
                      Voir l&apos;événement
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

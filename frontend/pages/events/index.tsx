import { GetServerSideProps } from 'next';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDebounce } from 'use-debounce';
import { EventItem } from '../../lib/api';

interface EventsPageProps {
  events: EventItem[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<EventsPageProps> = async (
  context,
) => {
  const page = parseInt((context.query.page as string) || '1', 10);
  const limit = 12;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const res = await fetch(`${API_URL}/events?page=${page}&limit=${limit}`);

    if (!res.ok) throw new Error('Erreur lors du chargement des événements');

    const data = await res.json();

    return {
      props: {
        events: data.events || [],
        total: data.total || 0,
        page,
        totalPages: Math.ceil((data.total || 0) / limit),
      },
    };
  } catch {
    return {
      props: {
        events: [],
        total: 0,
        page: 1,
        totalPages: 1,
        error: 'Impossible de charger les événements.',
      },
    };
  }
};

export default function EventsPage({
  events,
  total,
  page,
  totalPages,
  error,
}: EventsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const filteredEvents = useMemo(() => {
    if (!debouncedSearch.trim()) return events;
    const term = debouncedSearch.toLowerCase();
    return events.filter((event) =>
      event.title.toLowerCase().includes(term),
    );
  }, [events, debouncedSearch]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Événements
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          {total} événement{total !== 1 ? 's' : ''} disponible
          {total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un événement..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      {!error && events.length === 0 && (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">Aucun événement disponible</p>
          <p className="text-gray-400 text-sm mt-1">
            Revenez bientôt pour découvrir de nouveaux événements.
          </p>
        </div>
      )}

      {/* No search results */}
      {!error && events.length > 0 && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500">Aucun événement trouvé pour &quot;{debouncedSearch}&quot;</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:underline text-sm mt-2 cursor-pointer"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/events?page=${page - 1}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Précédent
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/events?page=${p}`}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={`/events?page=${page + 1}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Suivant
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const formattedDate = (() => {
    try {
      return format(new Date(event.date), 'd MMMM yyyy · HH:mm', {
        locale: fr,
      });
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
      ? 'text-green-600'
      : seatsPercent > 20
        ? 'text-yellow-600'
        : 'text-red-600';

  const statusBadge: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    CANCELED: 'bg-red-100 text-red-700',
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
    >
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={
              event.imageUrl.startsWith('http')
                ? event.imageUrl
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${event.imageUrl}`
            }
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <svg
              className="w-12 h-12 text-blue-300"
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

        {event.status !== 'PUBLISHED' && (
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[event.status] || ''}`}
          >
            {event.status}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
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
          <span className="truncate">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5">
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
          <span className="truncate">{event.location}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className={`text-sm font-medium ${seatsColor}`}>
            {event.remainingSeats > 0
              ? `${event.remainingSeats} place${event.remainingSeats > 1 ? 's' : ''} restante${event.remainingSeats > 1 ? 's' : ''}`
              : 'Complet'}
          </span>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

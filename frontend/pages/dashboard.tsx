import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getAdminEvents, getMyReservations } from '../lib/api';
import Loader from '../components/Loader';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    confirmed: 0,
    pending: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isAuthenticated) return;

    async function fetchStats() {
      try {
        if (isAdmin) {
          const data = await getAdminEvents(1, 1);
          setStats((s) => ({ ...s, totalEvents: data.total }));
        } else {
          const reservations = await getMyReservations();
          setStats({
            totalEvents: 0,
            totalReservations: reservations.length,
            confirmed: reservations.filter((r) => r.status === 'CONFIRMED')
              .length,
            pending: reservations.filter((r) => r.status === 'PENDING').length,
          });
        }
      } catch {
        // silently fail
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated) {
    return <Loader fullPage />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Bonjour, {user?.name} 👋
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          {isAdmin
            ? 'Tableau de bord administrateur'
            : 'Votre espace personnel'}
        </p>
      </div>

      {loadingStats ? (
        <Loader text="Chargement des statistiques..." />
      ) : isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Événements"
            value={stats.totalEvents}
            icon={
              <svg
                className="w-8 h-8 text-blue-500"
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
            }
            onClick={() => router.push('/events')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total réservations"
            value={stats.totalReservations}
            icon={
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
          <StatCard
            title="Confirmées"
            value={stats.confirmed}
            icon={
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="En attente"
            value={stats.pending}
            icon={
              <svg
                className="w-8 h-8 text-yellow-500"
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
            }
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-6 ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:border-gray-300 transition-all'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">{icon}</div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}

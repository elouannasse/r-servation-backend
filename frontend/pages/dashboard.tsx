import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getAdminEvents, getMyReservations } from "../lib/api";
import Loader from "../components/Loader";

interface Stats {
  count: number;
  label: string;
  href: string;
  icon: "calendar" | "ticket" | "clock" | "check";
  color: string;
}

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      setLoadingStats(true);
      try {
        if (user?.role === "admin") {
          const data = await getAdminEvents(1, 1);
          setStats([
            {
              count: data.total,
              label: "Événements créés",
              href: "/admin/events",
              icon: "calendar",
              color: "blue",
            },
          ]);
        } else {
          const reservations = await getMyReservations();
          const confirmed = reservations.filter(
            (r) => r.status === "CONFIRMED",
          ).length;
          const pending = reservations.filter(
            (r) => r.status === "PENDING",
          ).length;

          setStats([
            {
              count: reservations.length,
              label: "Mes réservations",
              href: "/reservations",
              icon: "ticket",
              color: "blue",
            },
            {
              count: confirmed,
              label: "Confirmées",
              href: "/reservations?status=CONFIRMED",
              icon: "check",
              color: "green",
            },
            {
              count: pending,
              label: "En attente",
              href: "/reservations?status=PENDING",
              icon: "clock",
              color: "yellow",
            },
          ]);
        }
      } catch {
        setStats([]);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [user]);

  if (loading || !isAuthenticated) {
    return <Loader fullPage />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Bonjour, {user?.name} 👋
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          {isAdmin
            ? "Gérez vos événements depuis votre tableau de bord."
            : "Retrouvez vos réservations en un coup d'œil."}
        </p>
      </div>

      {/* Stats cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
              <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md p-6 transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  stat.color === "blue"
                    ? "bg-blue-100 text-blue-600"
                    : stat.color === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                }`}
              >
                <IconFor icon={stat.icon} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium mt-3 group-hover:underline">
                Voir tout
                <svg
                  className="w-3 h-3"
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
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          {isAdmin ? (
            <>
              <Link
                href="/admin/events"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Gérer les événements
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Parcourir les événements
              </Link>
              <Link
                href="/reservations"
                className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Mes réservations
              </Link>
            </>
          )}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Mon profil
          </Link>
        </div>
      </div>
    </div>
  );
}

function IconFor({ icon }: { icon: string }) {
  switch (icon) {
    case "calendar":
      return (
        <svg
          className="w-5 h-5"
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
      );
    case "ticket":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
      );
    case "check":
      return (
        <svg
          className="w-5 h-5"
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
      );
    case "clock":
      return (
        <svg
          className="w-5 h-5"
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
      );
    default:
      return null;
  }
}

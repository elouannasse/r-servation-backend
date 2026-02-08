'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Stats {
  totalEvents: number;
  totalReservations: number;
  totalUsers: number;
  avgFillRate: number;
  eventsByStatus: { PUBLISHED: number; DRAFT: number; CANCELED: number };
  reservationsByStatus: { PENDING: number; CONFIRMED: number; REFUSED: number; CANCELED: number };
  topEvents: Array<{ title: string; reservations: number }>;
  recentActivity: Array<{ user: string; event: string; date: string; status: string }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer les données en parallèle
      const [eventsRes, reservationsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/events/admin`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/reservations/admin`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ json: async () => [] }))
      ]);

      const events = await eventsRes.json();
      const reservations = await reservationsRes.json();
      const users = await usersRes.json();

      // Calculer les statistiques
      const eventsByStatus = {
        PUBLISHED: events.events?.filter((e: any) => e.status === 'PUBLISHED').length || 0,
        DRAFT: events.events?.filter((e: any) => e.status === 'DRAFT').length || 0,
        CANCELED: events.events?.filter((e: any) => e.status === 'CANCELED').length || 0
      };

      const reservationsByStatus = {
        PENDING: reservations.filter((r: any) => r.status === 'PENDING').length,
        CONFIRMED: reservations.filter((r: any) => r.status === 'CONFIRMED').length,
        REFUSED: reservations.filter((r: any) => r.status === 'REFUSED').length,
        CANCELED: reservations.filter((r: any) => r.status === 'CANCELED').length
      };

      // Top événements
      const eventReservations = reservations.reduce((acc: any, r: any) => {
        const eventId = r.event?._id || r.event;
        acc[eventId] = (acc[eventId] || 0) + 1;
        return acc;
      }, {});

      const topEvents = events.events?.map((e: any) => ({
        title: e.title,
        reservations: eventReservations[e._id] || 0
      }))
      .sort((a: any, b: any) => b.reservations - a.reservations)
      .slice(0, 5) || [];

      // Activité récente
      const recentActivity = reservations
        .slice(0, 10)
        .map((r: any) => ({
          user: r.user?.name || 'Utilisateur',
          event: r.event?.title || 'Événement',
          date: r.createdAt,
          status: r.status
        }));

      // Taux de remplissage moyen
      const avgFillRate = events.events?.length > 0
        ? events.events.reduce((acc: number, e: any) => {
            const confirmed = reservations.filter((r: any) => 
              (r.event?._id || r.event) === e._id && r.status === 'CONFIRMED'
            ).length;
            return acc + (confirmed / e.capacity) * 100;
          }, 0) / events.events.length
        : 0;

      setStats({
        totalEvents: events.events?.length || 0,
        totalReservations: reservations.length,
        totalUsers: users.length || 0,
        avgFillRate: Math.round(avgFillRate),
        eventsByStatus,
        reservationsByStatus,
        topEvents,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!stats) {
    return <div className="p-8">Aucune donnée disponible</div>;
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalEvents}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Événements</h3>
          <div className="flex gap-2 text-xs">
            <span className="text-green-600">✓ {stats.eventsByStatus.PUBLISHED} publiés</span>
            <span className="text-yellow-600">• {stats.eventsByStatus.DRAFT} brouillons</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalReservations}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Réservations</h3>
          <div className="flex gap-2 text-xs">
            <span className="text-yellow-600">⏳ {stats.reservationsByStatus.PENDING} en attente</span>
            <span className="text-green-600">✓ {stats.reservationsByStatus.CONFIRMED} confirmées</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Utilisateurs</h3>
          <p className="text-xs text-gray-500">Participants inscrits</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.avgFillRate}%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Taux de Remplissage</h3>
          <p className="text-xs text-gray-500">Moyenne des événements</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Répartition des statuts de réservation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Répartition des Réservations
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-600 font-medium">En attente</span>
                <span className="font-semibold">{stats.reservationsByStatus.PENDING}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.reservationsByStatus.PENDING / stats.totalReservations) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 font-medium">Confirmées</span>
                <span className="font-semibold">{stats.reservationsByStatus.CONFIRMED}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.reservationsByStatus.CONFIRMED / stats.totalReservations) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 font-medium">Refusées</span>
                <span className="font-semibold">{stats.reservationsByStatus.REFUSED}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.reservationsByStatus.REFUSED / stats.totalReservations) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Annulées</span>
                <span className="font-semibold">{stats.reservationsByStatus.CANCELED}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(stats.reservationsByStatus.CANCELED / stats.totalReservations) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top événements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Événements
          </h3>
          <div className="space-y-3">
            {stats.topEvents.map((event, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium truncate">{event.title}</span>
                  <span className="font-semibold text-blue-600">{event.reservations}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(event.reservations / Math.max(...stats.topEvents.map(e => e.reservations))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activité Récente
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{activity.event}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'REFUSED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status === 'CONFIRMED' ? 'Confirmée' :
                       activity.status === 'PENDING' ? 'En attente' :
                       activity.status === 'REFUSED' ? 'Refusée' : 'Annulée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

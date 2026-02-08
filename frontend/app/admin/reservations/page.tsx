'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? `${API_URL}/reservations/admin`
        : `${API_URL}/reservations/admin?status=${filter}`;
      
      console.log('Fetching reservations from:', url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Reservations data:', data);
      
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/reservations/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Réservation approuvée !');
      fetchReservations();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Refuser cette réservation ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/reservations/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Réservation refusée');
      fetchReservations();
    } catch (error) {
      toast.error('Erreur lors du refus');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      REFUSED: 'bg-red-100 text-red-800',
      CANCELED: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      REFUSED: 'Refusée',
      CANCELED: 'Annulée'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-600 mt-1">
            {pendingCount > 0 && (
              <span className="text-orange-600 font-semibold">
                {pendingCount} en attente de validation
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'PENDING' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('CONFIRMED')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Confirmées
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{reservation.user?.name}</div>
                      <div className="text-sm text-gray-500">{reservation.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{reservation.event?.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(reservation.status)}
                </td>
                <td className="px-6 py-4">
                  {reservation.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(reservation._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(reservation._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {reservations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            Aucune réservation
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import EventTable from '@/components/EventTable';
import EventModal from '@/components/EventModal';
import EventFilters from '@/components/EventFilters';
import { toast, Toaster } from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier le rôle admin
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        
        if (user.role !== 'ADMIN') {
          router.push('/events');
          return;
        }
        
        fetchEvents();
      } catch {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3001/events/admin', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setEvents(data.events);
      setFilteredEvents(data.events);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    
    try {
      await fetch(`http://localhost:3001/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Événement supprimé');
      fetchEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
          <p className="text-gray-600 mt-1">{filteredEvents.length} événement(s)</p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Ajouter un événement
        </button>
      </div>

      <EventFilters 
        events={events} 
        onFilterChange={setFilteredEvents}
      />

      <EventTable 
        events={filteredEvents} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {isModalOpen && (
        <EventModal
          event={editingEvent}
          onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

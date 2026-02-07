import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function EventDetail({ event }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReservation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        { eventId: event.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Réservation créée ! En attente de confirmation.');
      router.push('/reservations');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover" />
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Lieu:</strong> {event.location}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Places restantes:</strong> {event.remainingSeats} / {event.capacity}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleReservation}
            disabled={isLoading || event.remainingSeats === 0}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isLoading || event.remainingSeats === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Chargement...
              </span>
            ) : event.remainingSeats === 0 ? (
              'Complet'
            ) : (
              'Réserver'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events/public/${id}`);
    return { props: { event: response.data } };
  } catch (error) {
    return { notFound: true };
  }
}

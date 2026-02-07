import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Reservations() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReservations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mes Réservations</h1>
      
      {reservations.length === 0 ? (
        <p className="text-gray-600">Aucune réservation trouvée.</p>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{reservation.event.title}</h3>
              <p className="text-gray-600">Date: {new Date(reservation.event.date).toLocaleDateString('fr-FR')}</p>
              <p className="text-gray-600">Lieu: {reservation.event.location}</p>
              <p className={`mt-2 font-semibold ${
                reservation.status === 'CONFIRMED' ? 'text-green-600' :
                reservation.status === 'PENDING' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Statut: {reservation.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

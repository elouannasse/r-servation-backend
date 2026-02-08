'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReserveButtonProps {
  eventId: string;
  disabled?: boolean;
  remainingSeats?: number;
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function ReserveButton({ 
  eventId, 
  disabled = false,
  remainingSeats,
  onSuccess,
  className = '',
  children = 'Réserver ma place'
}: ReserveButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReserve = async () => {
    // 1. Vérifier si user connecté
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vous devez être connecté pour réserver');
      router.push('/login');
      return;
    }

    // Warning si peu de places
    if (remainingSeats && remainingSeats <= 3 && remainingSeats > 0) {
      toast(
        `⚠️ Attention : seulement ${remainingSeats} place${remainingSeats > 1 ? 's' : ''} restante${remainingSeats > 1 ? 's' : ''} !`,
        { icon: '⚠️', duration: 3000 }
      );
    }

    // 2. Démarrer le chargement (désactive immédiatement le bouton)
    setLoading(true);

    try {
      // 3. Appeler l'API
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      // 4. Gérer la réponse
      if (!response.ok) {
        if (response.status === 409) {
          toast.error('Vous avez déjà réservé cet événement');
        } else if (response.status === 400) {
          toast.error(data.message || 'Événement complet ou non disponible');
        } else if (response.status === 404) {
          toast.error('Événement introuvable');
        } else if (response.status === 403) {
          toast.error('Accès refusé. Seuls les participants peuvent réserver.');
        } else {
          toast.error('Erreur lors de la réservation');
        }
        return;
      }

      // 5. Succès
      toast.success('Réservation effectuée ! En attente de confirmation.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error reserving:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReserve}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Réservation en cours...
        </>
      ) : (
        <>
          {remainingSeats && remainingSeats <= 3 && remainingSeats > 0 && (
            <AlertTriangle className="w-4 h-4" />
          )}
          {children}
        </>
      )}
    </button>
  );
}

/**
 * EXEMPLE D'UTILISATION DU COMPOSANT ReserveButton
 * 
 * Ce fichier montre comment utiliser le composant ReserveButton
 * dans différents contextes
 */

import ReserveButton from '@/components/ReserveButton';

// Exemple 1: Utilisation basique
export function BasicExample() {
  return (
    <ReserveButton 
      eventId="507f1f77bcf86cd799439011"
    />
  );
}

// Exemple 2: Avec callback de succès
export function WithCallbackExample() {
  const handleSuccess = () => {
    console.log('Réservation réussie !');
    // Rafraîchir la liste, rediriger, etc.
  };

  return (
    <ReserveButton 
      eventId="507f1f77bcf86cd799439011"
      onSuccess={handleSuccess}
    />
  );
}

// Exemple 3: Bouton désactivé (événement complet)
export function DisabledExample() {
  return (
    <ReserveButton 
      eventId="507f1f77bcf86cd799439011"
      disabled={true}
    >
      Complet
    </ReserveButton>
  );
}

// Exemple 4: Style personnalisé
export function CustomStyleExample() {
  return (
    <ReserveButton 
      eventId="507f1f77bcf86cd799439011"
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
    >
      Réserver maintenant
    </ReserveButton>
  );
}

// Exemple 5: Dans une carte d'événement
export function EventCardExample({ event }: any) {
  const handleReservationSuccess = () => {
    // Rafraîchir les données de l'événement
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-4">{event.description}</p>
      
      <ReserveButton
        eventId={event._id}
        disabled={event.remainingSeats === 0}
        onSuccess={handleReservationSuccess}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        {event.remainingSeats === 0 ? 'Complet' : `Réserver (${event.remainingSeats} places)`}
      </ReserveButton>
    </div>
  );
}

/**
 * FONCTIONNALITÉS DU COMPOSANT:
 * 
 * 1. Vérification automatique de l'authentification
 *    - Redirige vers /login si non connecté
 * 
 * 2. État de chargement
 *    - Affiche un spinner pendant la réservation
 *    - Désactive le bouton automatiquement
 * 
 * 3. Gestion des erreurs
 *    - Messages d'erreur spécifiques selon le code HTTP
 *    - Toast notifications pour le feedback utilisateur
 * 
 * 4. Callback de succès
 *    - Permet de rafraîchir les données après réservation
 * 
 * 5. Personnalisable
 *    - Style CSS via className
 *    - Texte du bouton via children
 *    - État disabled
 */

# Frontend - Système de Réservation

## Installation

```bash
cd frontend
npm install
```

## Configuration

Créer un fichier `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Démarrage

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Fonctionnalités implémentées

### Page de détails d'événement (`/events/[id]`)

- Affichage des informations de l'événement
- Bouton "Réserver" avec:
  - Loader pendant la requête
  - Gestion des erreurs (événement complet, déjà réservé)
  - Toast de succès/erreur
  - Redirection vers `/reservations` après succès
  - Désactivation si l'événement est complet

### Page des réservations (`/reservations`)

- Liste de toutes les réservations de l'utilisateur
- Affichage du statut (PENDING, CONFIRMED, CANCELED)

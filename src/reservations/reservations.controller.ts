import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Contrôleur pour la gestion des réservations
 * Toutes les routes sont protégées et nécessitent une authentification
 * 
 * Protection:
 * - @UseGuards(JwtAuthGuard) : Vérifie uniquement l'authentification
 * - Accessible par tous les utilisateurs authentifiés (ADMIN et PARTICIPANT)
 */
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  
  // GET /reservations - Lister les réservations de l'utilisateur connecté
  @Get()
  findMyReservations(@CurrentUser() user: any) {
    return {
      message: 'Mes réservations',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      reservations: [
        // Exemple de données
        { id: 1, eventId: 1, status: 'confirmed' },
        { id: 2, eventId: 3, status: 'pending' },
      ],
    };
  }

  // GET /reservations/:id - Obtenir une réservation spécifique
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      message: `Détails de la réservation ${id}`,
      reservation: {
        id,
        userId: user.id,
        eventId: 1,
        status: 'confirmed',
      },
    };
  }

  // POST /reservations - Créer une nouvelle réservation
  @Post()
  create(@Body() createReservationDto: any, @CurrentUser() user: any) {
    return {
      message: 'Réservation créée avec succès',
      reservation: {
        id: Date.now(),
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        ...createReservationDto,
        status: 'pending',
        createdAt: new Date(),
      },
    };
  }

  // DELETE /reservations/:id - Annuler une réservation
  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      message: `Réservation ${id} annulée avec succès`,
      cancelledBy: user.email,
      cancelledAt: new Date(),
    };
  }

  // GET /reservations/event/:eventId - Lister les réservations d'un événement
  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @CurrentUser() user: any) {
    return {
      message: `Réservations pour l'événement ${eventId}`,
      userId: user.id,
      reservations: [
        { id: 1, eventId, userId: user.id, status: 'confirmed' },
      ],
    };
  }
}

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
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  // GET /reservations - Lister les réservations de l'utilisateur connecté
  @Get()
  findMyReservations(@GetUser() user: any) {
    return {
      message: 'Mes réservations',
      userId: user.id,
      userEmail: user.email,
      reservations: [
        // Exemple de données
        { id: 1, eventId: 1, status: 'confirmed' },
        { id: 2, eventId: 3, status: 'pending' },
      ],
    };
  }

  // GET /reservations/:id - Obtenir une réservation spécifique
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
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
  create(@Body() createReservationDto: any, @GetUser() user: any) {
    return {
      message: 'Réservation créée avec succès',
      reservation: {
        id: Date.now(),
        userId: user.id,
        userEmail: user.email,
        ...createReservationDto,
        status: 'pending',
      },
    };
  }

  // DELETE /reservations/:id - Annuler une réservation
  @Delete(':id')
  cancel(@Param('id') id: string, @GetUser() user: any) {
    return {
      message: `Réservation ${id} annulée avec succès`,
      cancelledBy: user.email,
    };
  }

  // GET /reservations/event/:eventId - Lister les réservations d'un événement
  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @GetUser() user: any) {
    return {
      message: `Réservations pour l'événement ${eventId}`,
      userId: user.id,
      reservations: [
        { id: 1, eventId, userId: user.id, status: 'confirmed' },
      ],
    };
  }
}

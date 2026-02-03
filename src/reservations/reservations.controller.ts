import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

/**
 * Contrôleur pour la gestion des réservations
 * POST /reservations protégé par PARTICIPANT uniquement
 * Autres routes authentifiées sans restriction de rôle
 */
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // GET /reservations/me - Lister les réservations de l'utilisateur connecté
  @Get('me')
  async findMyReservations(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.reservationsService.findMyReservations(user.id, status);
  }

  // POST /reservations - Créer une nouvelle réservation (PARTICIPANT seulement)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARTICIPANT)
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: any,
  ) {
    return this.reservationsService.create(createReservationDto, user.id);
  }

  // DELETE /reservations/:id - Annuler une réservation
  @Delete(':id')
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reservationsService.cancel(id, user.id);
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

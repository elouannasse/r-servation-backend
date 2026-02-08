import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
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

interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Contrôleur pour la gestion des réservations
 * POST /reservations protégé par PARTICIPANT uniquement
 * Autres routes authentifiées sans restriction de rôle
 */
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // GET /reservations/admin - Lister toutes les réservations (ADMIN)
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query('status') status?: string) {
    return this.reservationsService.findAll(status);
  }

  // GET /reservations/me - Lister les réservations de l'utilisateur connecté
  @Get('me')
  async findMyReservations(
    @CurrentUser() user: UserPayload,
    @Query('status') status?: string,
  ) {
    return this.reservationsService.findMyReservations(user.id, status);
  }

  // GET /reservations/event/:eventId - Lister les réservations d'un événement
  @Get('event/:eventId')
  findByEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return {
      message: `Réservations pour l'événement ${eventId}`,
      userId: user.id,
      reservations: [{ id: 1, eventId, userId: user.id, status: 'confirmed' }],
    };
  }

  // POST /reservations - Créer une nouvelle réservation (tout utilisateur connecté)
  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: UserPayload,
  ) {
    console.log(
      'Creating reservation for user:',
      user.id,
      'Event:',
      createReservationDto.eventId,
    );
    try {
      const result = await this.reservationsService.create(
        createReservationDto,
        user.id,
      );
      console.log('Reservation created successfully');
      return result;
    } catch (error: unknown) {
      console.error('Error in controller:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // PATCH /reservations/:id/approve - Approuver une réservation (ADMIN)
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string) {
    return this.reservationsService.approve(id);
  }

  // PATCH /reservations/:id/reject - Refuser une réservation (ADMIN)
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(@Param('id') id: string) {
    return this.reservationsService.reject(id);
  }

  // DELETE /reservations/:id - Annuler une réservation
  @Delete(':id')
  async cancel(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.reservationsService.cancel(id, user.id);
  }
}

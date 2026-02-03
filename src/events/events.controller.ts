import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

/**
 * Contrôleur pour la gestion des événements
 * Toutes les routes sont protégées et nécessitent le rôle ADMIN
 * 
 * Protection:
 * - @UseGuards(JwtAuthGuard, RolesGuard) : Vérifie l'authentification et les rôles
 * - @Roles(UserRole.ADMIN) : Seuls les ADMIN peuvent accéder
 */
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  
  // GET /events - Lister tous les événements (ADMIN seulement)
  @Get()
  findAll(@CurrentUser() user: any) {
    return {
      message: 'Liste de tous les événements',
      requestedBy: user.email,
      role: user.role,
    };
  }

  // GET /events/:id - Obtenir un événement (ADMIN seulement)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      message: `Détails de l'événement ${id}`,
      requestedBy: user.email,
    };
  }

  // POST /events - Créer un événement (ADMIN seulement)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }

  // PUT /events/:id - Modifier un événement (ADMIN seulement)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: any,
    @CurrentUser() user: any,
  ) {
    return {
      message: `Événement ${id} modifié avec succès`,
      event: updateEventDto,
      updatedBy: user.email,
    };
  }

  // DELETE /events/:id - Supprimer un événement (ADMIN seulement)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      message: `Événement ${id} supprimé avec succès`,
      deletedBy: user.email,
    };
  }
}

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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

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
  
  // GET /events/admin - Lister TOUS les événements avec pagination (ADMIN seulement)
  @Get('admin')
  async findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.eventsService.findAll(pageNum, limitNum);
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
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  // DELETE /events/:id - Annuler un événement (soft delete - ADMIN seulement)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}

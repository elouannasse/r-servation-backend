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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { multerConfig } from '../config/multer.config';

interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Contrôleur pour la gestion des événements
 * Routes publiques: GET /events (événements publiés)
 * Routes protégées ADMIN: Toutes les autres routes
 *
 * Protection:
 * - @UseGuards(JwtAuthGuard, RolesGuard) : Vérifie l'authentification et les rôles
 * - @Roles(UserRole.ADMIN) : Seuls les ADMIN peuvent accéder
 */
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // GET /events - Lister les événements publiés (PUBLIC - pas d'authentification requise)
  @Get()
  async findAllPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFilter') dateFilter?: 'week' | 'month' | 'all',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const filter = dateFilter || 'all';
    return this.eventsService.findAllPublic(pageNum, limitNum, filter);
  }

  // GET /events/admin - Lister TOUS les événements avec pagination (ADMIN seulement)
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.eventsService.findAll(pageNum, limitNum);
  }

  // GET /events/admin/:id - Obtenir les détails complets d'un événement (ADMIN seulement)
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOneAdmin(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // GET /events/:id - Obtenir un événement publié (PUBLIC - pas d'authentification requise)
  @Get(':id')
  async findOnePublic(@Param('id') id: string) {
    return this.eventsService.findOnePublic(id);
  }

  // POST /events - Créer un événement (ADMIN seulement)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }

  // PUT /events/:id - Modifier un événement (ADMIN seulement)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  // DELETE /events/:id - Annuler un événement (soft delete - ADMIN seulement)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // POST /events/:id/upload-image - Upload d'image pour un événement (ADMIN seulement)
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Créer l'URL de l'image
    const imageUrl = `/uploads/events/${file.filename}`;

    // Mettre à jour l'événement avec l'URL de l'image
    const updatedEvent = await this.eventsService.updateImageUrl(id, imageUrl);

    return {
      message: 'Image uploadée avec succès',
      imageUrl,
      event: updatedEvent,
    };
  }
}

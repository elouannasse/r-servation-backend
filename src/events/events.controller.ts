import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EventsController {
  // GET /events - Lister tous les événements (ADMIN seulement)
  @Get()
  findAll(@GetUser() user: any) {
    return {
      message: 'Liste de tous les événements',
      requestedBy: user.email,
    };
  }

  // GET /events/:id - Obtenir un événement (ADMIN seulement)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return {
      message: `Détails de l'événement ${id}`,
      requestedBy: user.email,
    };
  }

  // POST /events - Créer un événement (ADMIN seulement)
  @Post()
  create(@Body() createEventDto: any, @GetUser() user: any) {
    return {
      message: 'Événement créé avec succès',
      event: createEventDto,
      createdBy: user.email,
    };
  }

  // PUT /events/:id - Modifier un événement (ADMIN seulement)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: any,
    @GetUser() user: any,
  ) {
    return {
      message: `Événement ${id} modifié avec succès`,
      event: updateEventDto,
      updatedBy: user.email,
    };
  }

  // DELETE /events/:id - Supprimer un événement (ADMIN seulement)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    return {
      message: `Événement ${id} supprimé avec succès`,
      deletedBy: user.email,
    };
  }
}

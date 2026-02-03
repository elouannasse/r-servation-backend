import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '../enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Récupérer tous les événements avec pagination et populate
    const events = await this.eventModel
      .find()
      .sort({ date: -1 }) // Tri par date décroissante
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email') // Populate createdBy avec name et email
      .exec();

    // Compter le total d'événements
    const total = await this.eventModel.countDocuments();

    return {
      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        imageUrl: event.imageUrl,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    // Récupérer l'événement avec populate
    const event = await this.eventModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    // TODO: Calculer les réservations une fois l'entité Reservation créée
    // Pour l'instant, on retourne des valeurs par défaut
    const reservationsCount = 0;
    const confirmedReservations = 0;
    const remainingSeats = event.capacity - confirmedReservations;

    return {
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      status: event.status,
      imageUrl: event.imageUrl,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      // Champs calculés
      reservationsCount,
      confirmedReservations,
      remainingSeats,
    };
  }

  async create(createEventDto: CreateEventDto, userId: string) {
    const newEvent = new this.eventModel({
      ...createEventDto,
      date: new Date(createEventDto.date),
      status: EventStatus.DRAFT,
      createdBy: userId,
    });

    const savedEvent = await newEvent.save();

    return {
      message: 'Événement créé avec succès',
      event: {
        id: savedEvent._id,
        title: savedEvent.title,
        description: savedEvent.description,
        date: savedEvent.date,
        location: savedEvent.location,
        capacity: savedEvent.capacity,
        status: savedEvent.status,
        imageUrl: savedEvent.imageUrl,
        createdBy: savedEvent.createdBy,
        createdAt: savedEvent.createdAt,
        updatedAt: savedEvent.updatedAt,
      },
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    // Vérifier que l'événement existe
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    // Préparer les données à mettre à jour
    const updateData: any = { ...updateEventDto };
    
    // Convertir la date si elle est fournie
    if (updateEventDto.date) {
      updateData.date = new Date(updateEventDto.date);
    }

    // Mettre à jour l'événement
    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    return {
      message: 'Événement mis à jour avec succès',
      event: {
        id: updatedEvent._id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.date,
        location: updatedEvent.location,
        capacity: updatedEvent.capacity,
        status: updatedEvent.status,
        imageUrl: updatedEvent.imageUrl,
        createdBy: updatedEvent.createdBy,
        createdAt: updatedEvent.createdAt,
        updatedAt: updatedEvent.updatedAt,
      },
    };
  }

  async remove(id: string) {
    // Vérifier que l'événement existe
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    // Soft delete: changer le status à CANCELED
    await this.eventModel.findByIdAndUpdate(
      id,
      { status: EventStatus.CANCELED },
      { new: true },
    );

    return {
      message: 'Event canceled successfully',
    };
  }

  async updateImageUrl(id: string, imageUrl: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      id,
      { imageUrl },
      { new: true },
    );

    return updatedEvent;
  }
}

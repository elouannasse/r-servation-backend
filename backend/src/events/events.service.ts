import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import {
  Reservation,
  ReservationDocument,
} from '../schemas/reservation.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '../enums/event-status.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
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

  async findAllPublic(
    page: number = 1,
    limit: number = 10,
    dateFilter: 'week' | 'month' | 'all' = 'all',
  ) {
    const skip = (page - 1) * limit;
    const now = new Date();

    // Calculer la date de fin selon le filtre
    let endDate: Date | undefined;
    if (dateFilter === 'week') {
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);
    } else if (dateFilter === 'month') {
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);
    }

    // Filtrer: status = PUBLISHED et date >= aujourd'hui

    const filter: Record<string, unknown> = {
      status: EventStatus.PUBLISHED,
      date: endDate ? { $gte: now, $lte: endDate } : { $gte: now },
    };

    // Récupérer les événements publiés avec pagination

    const events = await this.eventModel
      .find(filter)
      .sort({ date: 1 }) // Tri par date croissante
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .exec();

    // Compter le total d'événements correspondants
    const total = await this.eventModel.countDocuments(filter);

    // Ajouter remainingSeats pour chaque événement
    const eventsWithSeats = await Promise.all(
      events.map(async (event) => {
        const remainingSeats = await this.calculateRemainingSeats(
          event._id.toString(),
        );
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
          remainingSeats,
        };
      }),
    );

    return {
      events: eventsWithSeats,
      total,
      page,
      limit,
    };
  }

  async findOnePublic(id: string) {
    // Récupérer l'événement et populate createdBy (name uniquement)
    const event = await this.eventModel
      .findById(id)
      .populate('createdBy', 'name')
      .exec();

    // Vérifier que l'événement existe
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    // Vérifier que l'événement est publié (sinon 404)
    if (event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    // Calculer les places restantes
    const remainingSeats = await this.calculateRemainingSeats(id);

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
      remainingSeats,
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

    // Calculer les places restantes
    const remainingSeats = await this.calculateRemainingSeats(id);

    // Compter toutes les réservations et les confirmées
    const reservationsCount = await this.reservationModel.countDocuments({
      event: id,
    });
    const confirmedReservations = await this.reservationModel.countDocuments({
      event: id,
      status: ReservationStatus.CONFIRMED,
    });

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

    const updateData: Record<string, unknown> = { ...updateEventDto };

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

  async calculateRemainingSeats(eventId: string): Promise<number> {
    // 1. Récupère l'événement
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`);
    }

    // 2. Compte les réservations avec status = CONFIRMED
    const confirmedCount = await this.reservationModel.countDocuments({
      event: eventId,
      status: ReservationStatus.CONFIRMED,
    });

    // 3. Retourne capacity - confirmedCount
    return event.capacity - confirmedCount;
  }
}

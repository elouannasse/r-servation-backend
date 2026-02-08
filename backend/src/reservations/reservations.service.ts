import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from '../schemas/reservation.schema';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EventStatus } from '../enums/event-status.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async findMyReservations(userId: string, status?: string) {
    // Construire le filtre

    const filter: Record<string, unknown> = { user: userId };

    // Ajouter le filtre par status si fourni
    if (status) {
      filter.status = status;
    }

    // Récupérer les réservations avec populate et tri

    const reservations = await this.reservationModel
      .find(filter)
      .populate('event', 'title date location imageUrl status')
      .sort({ createdAt: -1 }) // Tri par createdAt décroissant
      .exec();

    return reservations;
  }

  async findAll(status?: string) {
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const reservations = await this.reservationModel
      .find(filter)
      .populate('event', 'title date location')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return reservations;
  }

  async approve(id: string) {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Seules les réservations en attente peuvent être approuvées',
      );
    }

    // Vérifier la capacité
    const event = await this.eventModel.findById(reservation.event);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    const confirmedCount = await this.reservationModel.countDocuments({
      event: reservation.event,
      status: ReservationStatus.CONFIRMED,
    });

    if (confirmedCount >= event.capacity) {
      throw new BadRequestException('Événement complet');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    await reservation.save();

    return { message: 'Réservation approuvée', reservation };
  }

  async reject(id: string) {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Seules les réservations en attente peuvent être refusées',
      );
    }

    reservation.status = ReservationStatus.REFUSED;
    await reservation.save();

    return { message: 'Réservation refusée', reservation };
  }

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { eventId } = createReservationDto;

    console.log('Creating reservation:', { eventId, userId });

    // 1. Vérifie que l'événement existe
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      console.error('Event not found:', eventId);
      throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`);
    }

    console.log('Event found:', event.title, 'Status:', event.status);

    // 2. Vérifie que status = PUBLISHED
    if (event.status !== EventStatus.PUBLISHED) {
      console.error('Event not published:', event.status);
      throw new BadRequestException(
        "Impossible de réserver : l'événement n'est pas publié",
      );
    }

    // 3. Vérifie qu'il n'a pas déjà une réservation active
    const existingReservation = await this.reservationModel.findOne({
      event: eventId,
      user: userId,
      status: {
        $nin: [ReservationStatus.CANCELED, ReservationStatus.REFUSED],
      },
    });

    if (existingReservation) {
      console.error('Existing reservation found:', existingReservation._id);
      throw new ConflictException(
        'Vous avez déjà une réservation active pour cet événement',
      );
    }

    // 4. Vérifie la disponibilité (PENDING + CONFIRMED comptent comme places prises)
    const activeCount = await this.reservationModel.countDocuments({
      event: eventId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    console.log(
      'Active reservations (pending+confirmed):',
      activeCount,
      'Capacity:',
      event.capacity,
    );

    if (activeCount >= event.capacity) {
      throw new BadRequestException('Événement complet');
    }

    // 5. Crée la réservation avec status = PENDING
    const newReservation = new this.reservationModel({
      event: eventId,
      user: userId,
      status: ReservationStatus.PENDING,
    });

    const savedReservation = await newReservation.save();
    console.log('Reservation created:', savedReservation._id);

    // 6. Populate pour retourner les détails
    const populatedReservation = await this.reservationModel
      .findById(savedReservation._id)
      .populate('event', 'title date location')
      .populate('user', 'name email')
      .exec();

    return populatedReservation;
  }

  async cancel(id: string, userId: string) {
    // Vérifie que la réservation existe
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    // Vérifie que c'est bien la réservation du user connecté
    if (reservation.user.toString() !== userId) {
      throw new ConflictException(
        'Vous ne pouvez pas annuler cette réservation',
      );
    }

    // Change status à CANCELED
    await this.reservationModel.findByIdAndUpdate(
      id,
      { status: ReservationStatus.CANCELED },
      { new: true },
    );

    return {
      message: 'Reservation canceled successfully',
    };
  }

  private async checkAvailability(eventId: string): Promise<boolean> {
    // 1. Récupère l'événement
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      return false;
    }

    // 2. Compte les réservations actives (PENDING + CONFIRMED)
    const activeCount = await this.reservationModel.countDocuments({
      event: eventId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    // 3. Return activeCount < event.capacity
    return activeCount < event.capacity;
  }
}

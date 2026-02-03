import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
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

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { eventId } = createReservationDto;

    // 1. Vérifie que l'événement existe
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`);
    }

    // 2. Vérifie que status = PUBLISHED
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        "Impossible de réserver : l'événement n'est pas publié",
      );
    }

    // 3. Vérifie que remainingSeats > 0
    const confirmedCount = await this.reservationModel.countDocuments({
      event: eventId,
      status: ReservationStatus.CONFIRMED,
    });
    const remainingSeats = event.capacity - confirmedCount;

    if (remainingSeats <= 0) {
      throw new BadRequestException('Event full');
    }

    // 4. Vérifie qu'il n'a pas déjà une réservation active (status != CANCELED, REFUSED)
    const existingReservation = await this.reservationModel.findOne({
      event: eventId,
      user: userId,
      status: {
        $nin: [ReservationStatus.CANCELED, ReservationStatus.REFUSED],
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        'Vous avez déjà une réservation active pour cet événement',
      );
    }

    // Crée la réservation avec status = PENDING
    const newReservation = new this.reservationModel({
      event: eventId,
      user: userId,
      status: ReservationStatus.PENDING,
    });

    const savedReservation = await newReservation.save();

    // Populate pour retourner les détails
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
}

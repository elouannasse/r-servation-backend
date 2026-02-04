import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { Reservation } from '../schemas/reservation.schema';
import { Event } from '../schemas/event.schema';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { EventStatus } from '../enums/event-status.enum';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationModel: any;
  let eventModel: any;

  const mockReservation = {
    _id: 'resId',
    event: 'eventId',
    user: 'userId',
    status: ReservationStatus.PENDING,
    save: jest.fn(),
  };

  const mockReservationModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  const mockEventModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationModel = module.get(getModelToken(Reservation.name));
    eventModel = module.get(getModelToken(Event.name));
  });

  describe('checkAvailability', () => {
    it('should return true if seats are available', async () => {
      eventModel.findById.mockResolvedValue({ _id: 'eventId', capacity: 10 });
      reservationModel.countDocuments.mockResolvedValue(5);

      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(true);
    });

    it('should return false if event is full', async () => {
      eventModel.findById.mockResolvedValue({ _id: 'eventId', capacity: 10 });
      reservationModel.countDocuments.mockResolvedValue(10);

      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if event is full', async () => {
      eventModel.findById.mockResolvedValue({ _id: 'eventId', capacity: 10, status: EventStatus.PUBLISHED });
      reservationModel.countDocuments.mockResolvedValue(10); // Full

      await expect(service.create({ eventId: 'eventId' }, 'userId'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already has an active reservation', async () => {
      eventModel.findById.mockResolvedValue({ _id: 'eventId', capacity: 10, status: EventStatus.PUBLISHED });
      reservationModel.countDocuments.mockResolvedValue(5); // Available
      reservationModel.findOne.mockResolvedValue({ _id: 'existingResId' }); // Already reserved

      await expect(service.create({ eventId: 'eventId' }, 'userId'))
        .rejects.toThrow(ConflictException);
    });
  });
});

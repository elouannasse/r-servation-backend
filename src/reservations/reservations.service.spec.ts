import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { Reservation } from '../schemas/reservation.schema';
import { Event } from '../schemas/event.schema';
import { EventStatus } from '../enums/event-status.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationModel: {
    find: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
    countDocuments: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    exec: jest.Mock;
    db: { startSession: jest.Mock };
  };
  let eventModel: { findById: jest.Mock };

  const mockReservationModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn().mockReturnValue({
      session: jest.fn().mockReturnThis(),
    }),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
    db: {
      startSession: jest.fn().mockResolvedValue({
        withTransaction: jest
          .fn()
          .mockImplementation((fn: () => unknown) => fn()),
        endSession: jest.fn(),
      }),
    },
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(true);
    });

    it('should return false if event is full', async () => {
      eventModel.findById.mockResolvedValue({ _id: 'eventId', capacity: 10 });
      reservationModel.countDocuments.mockResolvedValue(10);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if event is full', async () => {
      eventModel.findById.mockResolvedValue({
        _id: 'eventId',
        capacity: 10,
        status: EventStatus.PUBLISHED,
      });
      reservationModel.findOne.mockResolvedValue(null); // No existing reservation

      // Mock countDocuments to return 10 (full capacity)
      const mockCountQuery = {
        session: jest.fn().mockResolvedValue(10),
      };
      reservationModel.countDocuments.mockReturnValue(mockCountQuery);

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already has an active reservation', async () => {
      eventModel.findById.mockResolvedValue({
        _id: 'eventId',
        capacity: 10,
        status: EventStatus.PUBLISHED,
      });
      reservationModel.countDocuments.mockResolvedValue(5); // Available
      reservationModel.findOne.mockResolvedValue({ _id: 'existingResId' }); // Already reserved

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(ConflictException);
    });
  });
});

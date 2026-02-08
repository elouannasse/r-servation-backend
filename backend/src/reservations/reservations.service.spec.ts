import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { Reservation } from '../schemas/reservation.schema';
import { Event } from '../schemas/event.schema';
import { EventStatus } from '../enums/event-status.enum';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;

  // Helper to create a mock query object that is both chainable and thenable

  const createMockQuery = (result: any) => ({
    exec: jest.fn().mockResolvedValue(result),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    then: (resolve: (value: any) => void) =>
      Promise.resolve(result).then(resolve),
  });

  // Mock class/constructor for ReservationModel
  const MockReservationModel = jest.fn().mockImplementation((data) => ({
    save: jest.fn().mockResolvedValue({ _id: 'newReservationId', ...data }),
  })) as unknown as {
    new (data: any): any;
    find: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
    countDocuments: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  // Assign static methods to MockReservationModel
  Object.assign(MockReservationModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  });

  // Mock class for EventModel
  class MockEventModel {
    constructor(private data: any) {}
    save = jest.fn().mockResolvedValue(this.data);
    static findById: jest.Mock = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: MockReservationModel,
        },
        {
          provide: getModelToken(Event.name),
          useValue: MockEventModel,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    // Clear and reset mocks
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should return true if seats are available', async () => {
      // Mock EventModel.findById to return the event
      MockEventModel.findById.mockReturnValue(
        createMockQuery({
          _id: 'eventId',
          capacity: 10,
          status: EventStatus.PUBLISHED,
        }),
      );

      // Mock ReservationModel.countDocuments to return 5
      MockReservationModel.countDocuments.mockReturnValue(createMockQuery(5));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(true);
    });

    it('should return false if event is full', async () => {
      MockEventModel.findById.mockReturnValue(
        createMockQuery({
          _id: 'eventId',
          capacity: 10,
          status: EventStatus.PUBLISHED,
        }),
      );
      MockReservationModel.countDocuments.mockReturnValue(createMockQuery(10));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if event is full', async () => {
      MockEventModel.findById.mockReturnValue(
        createMockQuery({
          _id: 'eventId',
          capacity: 10,
          status: EventStatus.PUBLISHED,
        }),
      );
      // mock findOne -> null (no existing reservation)
      MockReservationModel.findOne.mockReturnValue(createMockQuery(null));
      // mock countDocuments -> 10 (full)
      MockReservationModel.countDocuments.mockReturnValue(createMockQuery(10));

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already has an active reservation', async () => {
      MockEventModel.findById.mockReturnValue(
        createMockQuery({
          _id: 'eventId',
          capacity: 10,
          status: EventStatus.PUBLISHED,
        }),
      );
      // mock findOne -> returns existing reservation
      MockReservationModel.findOne.mockReturnValue(
        createMockQuery({ _id: 'existingResId' }),
      );

      // countDocuments should arguably not be called if conflict is found first,
      // but if it is, let's mock it anyway to be safe
      MockReservationModel.countDocuments.mockReturnValue(createMockQuery(5));

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a reservation successfully', async () => {
      const mockEvent = {
        _id: 'eventId',
        capacity: 10,
        status: EventStatus.PUBLISHED,
        title: 'Test Event',
        date: new Date(),
        location: 'Test Location',
        imageUrl: 'test.jpg',
      };

      MockEventModel.findById.mockReturnValue(createMockQuery(mockEvent));
      MockReservationModel.findOne.mockReturnValue(createMockQuery(null));
      MockReservationModel.countDocuments.mockReturnValue(createMockQuery(5));
      MockReservationModel.findById.mockReturnValue(
        createMockQuery({
          _id: 'newReservationId',
          event: mockEvent,
          user: { name: 'Test User', email: 'test@example.com' },
          status: 'PENDING',
        }),
      );

      const result = await service.create({ eventId: 'eventId' }, 'userId');

      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(MockReservationModel).toHaveBeenCalledWith({
        event: 'eventId',
        user: 'userId',
        status: 'PENDING',
      });
    });

    it('should throw BadRequestException if event is not published', async () => {
      MockEventModel.findById.mockReturnValue(
        createMockQuery({
          _id: 'eventId',
          capacity: 10,
          status: EventStatus.DRAFT,
        }),
      );

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      MockEventModel.findById.mockReturnValue(createMockQuery(null));

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

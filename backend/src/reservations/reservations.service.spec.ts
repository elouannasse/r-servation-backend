import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { Reservation } from '../schemas/reservation.schema';
import { Event } from '../schemas/event.schema';
import { EventStatus } from '../enums/event-status.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;

  // Mock class/constructor for ReservationModel
  const MockReservationModel = jest.fn().mockImplementation((data) => ({
    save: jest.fn().mockResolvedValue({ _id: 'newReservationId', ...data }), // Mock save for instances
  })) as unknown as {
    new(data: any): any;
    find: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
    countDocuments: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    populate: jest.Mock;
    exec: jest.Mock;
    sort: jest.Mock;
  };

  // Assign static methods to the MockReservationModel (constructor)
  Object.assign(MockReservationModel, {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    sort: jest.fn().mockReturnThis(),
  });

  // Mock class for EventModel
  class MockEventModel {
    constructor(private data: any) {}
    save = jest.fn().mockResolvedValue(this.data);
    static findById: jest.Mock = jest.fn().mockReturnThis();
    static exec: jest.Mock = jest.fn(); // exec will resolve the promise with the mocked data
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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });


  describe('checkAvailability', () => {
    it('should return true if seats are available', async () => {
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue({ _id: 'eventId', capacity: 10, status: EventStatus.PUBLISHED });
      MockReservationModel.countDocuments.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(5);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(true);
    });

    it('should return false if event is full', async () => {
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue({ _id: 'eventId', capacity: 10, status: EventStatus.PUBLISHED });
      MockReservationModel.countDocuments.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(10);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await (service as any).checkAvailability('eventId');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if event is full', async () => {
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue({
        _id: 'eventId',
        capacity: 10,
        status: EventStatus.PUBLISHED,
      });
      MockReservationModel.findOne.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(null); // No existing reservation

      // Mock countDocuments to return 10 (full capacity)
      MockReservationModel.countDocuments.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(10);

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already has an active reservation', async () => {
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue({
        _id: 'eventId',
        capacity: 10,
        status: EventStatus.PUBLISHED,
      });
      MockReservationModel.countDocuments.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(5); // Available
      MockReservationModel.findOne.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue({ _id: 'existingResId' }); // Already reserved

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
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue(mockEvent);
      MockReservationModel.findOne.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(null);
      MockReservationModel.countDocuments.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue(5);
      MockReservationModel.findById.mockReturnThis();
      MockReservationModel.populate.mockReturnThis();
      MockReservationModel.exec.mockResolvedValue({
        _id: 'newReservationId',
        event: mockEvent,
        user: { name: 'Test User', email: 'test@example.com' },
        status: 'PENDING',
      });
      
      const result = await service.create({ eventId: 'eventId' }, 'userId');
      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(MockReservationModel).toHaveBeenCalledWith({ // Note: This uses the constructor mock
        event: 'eventId',
        user: 'userId',
        status: 'PENDING',
      });
      expect(MockReservationModel.findOne).toHaveBeenCalledWith({
        event: 'eventId',
        user: 'userId',
        status: { '$nin': ['CANCELED', 'REFUSED'] },
      });
      expect(MockReservationModel.countDocuments).toHaveBeenCalledWith({
        event: 'eventId',
        status: { '$in': ['PENDING', 'CONFIRMED'] },
      });
      expect(MockReservationModel.findById).toHaveBeenCalledWith('newReservationId');
    });

    it('should throw BadRequestException if event is not published', async () => {
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue({
        _id: 'eventId',
        capacity: 10,
        status: EventStatus.DRAFT,
      });

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(BadRequestException);
      expect(MockEventModel.findById).toHaveBeenCalledWith('eventId');
      expect(MockReservationModel.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if event does not exist', async () => {
      MockEventModel.findById.mockReturnThis();
      MockEventModel.exec.mockResolvedValue(null);

      await expect(
        service.create({ eventId: 'eventId' }, 'userId'),
      ).rejects.toThrow(NotFoundException);
      expect(MockEventModel.findById).toHaveBeenCalledWith('eventId');
      expect(MockReservationModel.findOne).not.toHaveBeenCalled();
    });
  });
});

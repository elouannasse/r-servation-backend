import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { Event } from '../schemas/event.schema';
import { Reservation } from '../schemas/reservation.schema';
import { EventStatus } from '../enums/event-status.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';

describe('EventsService', () => {
  let service: EventsService;
  let eventModel: any;
  let reservationModel: any;

  const mockEvent = {
    _id: 'eventId',
    title: 'Test Event',
    capacity: 10,
    status: EventStatus.DRAFT,
    save: jest.fn().mockResolvedValue({
      _id: 'eventId',
      title: 'Test Event',
      capacity: 10,
      status: EventStatus.DRAFT,
    }),
  };

  const mockEventModel = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: jest.fn().mockResolvedValue({
      _id: 'eventId',
      ...data,
      status: EventStatus.DRAFT,
    }),
  }));
  
  // Add static methods to the mock constructor
  Object.assign(mockEventModel, {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  });

  const mockReservationModel = {
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventModel = module.get(getModelToken(Event.name));
    reservationModel = module.get(getModelToken(Reservation.name));
  });

  describe('calculateRemainingSeats', () => {
    it('should return remaining seats correctly', async () => {
      eventModel.findById.mockResolvedValue({ capacity: 10 });
      reservationModel.countDocuments.mockResolvedValue(4);

      const result = await service.calculateRemainingSeats('eventId');
      expect(result).toBe(6);
      expect(eventModel.findById).toHaveBeenCalledWith('eventId');
      expect(reservationModel.countDocuments).toHaveBeenCalledWith({
        event: 'eventId',
        status: ReservationStatus.CONFIRMED,
      });
    });
  });

  describe('create', () => {
    it('should create an event with valid data', async () => {
      const createEventDto = {
        title: 'New Event',
        description: 'Desc',
        date: new Date(),
        location: 'Loc',
        capacity: 20,
      };
      
      const savedEvent = {
        _id: 'newId',
        ...createEventDto,
        status: EventStatus.DRAFT,
        createdBy: 'userId',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the save method to return the saved event
      const mockSave = jest.fn().mockResolvedValue(savedEvent);
      mockEventModel.mockReturnValueOnce({
        ...createEventDto,
        save: mockSave,
      });
      
      const result = await service.create(createEventDto as any, 'userId');
      
      expect(result.message).toBe('Événement créé avec succès');
      expect(result.event.title).toBe(createEventDto.title);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});

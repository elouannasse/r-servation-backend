import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { EventStatus } from '../enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

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
}

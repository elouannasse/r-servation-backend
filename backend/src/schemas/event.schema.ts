import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventStatus } from '../enums/event-status.enum';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({
    required: true,
    minlength: 3,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    required: true,
    type: Date,
  })
  date: Date;

  @Prop({
    required: true,
    trim: true,
  })
  location: string;

  @Prop({
    required: true,
    min: 1,
    type: Number,
  })
  capacity: number;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Prop({
    required: false,
    trim: true,
  })
  imageUrl?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Validation personnalisée pour s'assurer que la date est dans le futur
EventSchema.pre('save', function () {
  if (this.isNew || this.isModified('date')) {
    const now = new Date();
    if (this.date < now) {
      throw new Error("La date de l'événement doit être dans le futur");
    }
  }
});

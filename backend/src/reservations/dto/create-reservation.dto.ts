import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: "L'ID de l'événement est requis" })
  @IsMongoId({ message: "L'ID de l'événement doit être un ObjectId valide" })
  eventId: string;
}

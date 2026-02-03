import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EventStatus } from '../../enums/event-status.enum';

export class UpdateEventDto {
  @IsOptional()
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre ne peut pas être vide' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description ne peut pas être vide' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La date doit être au format ISO 8601' })
  @IsNotEmpty({ message: 'La date ne peut pas être vide' })
  @Transform(({ value }) => {
    const date = new Date(value);
    const now = new Date();
    if (date < now) {
      throw new Error('La date doit être dans le futur');
    }
    return value;
  })
  date?: string;

  @IsOptional()
  @IsString({ message: 'Le lieu doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le lieu ne peut pas être vide' })
  location?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La capacité doit être un nombre' })
  @Min(1, { message: 'La capacité doit être au moins 1' })
  capacity?: number;

  @IsOptional()
  @IsEnum(EventStatus, { message: 'Le statut doit être DRAFT, PUBLISHED ou CANCELED' })
  status?: EventStatus;

  @IsOptional()
  @IsString({ message: "L'URL de l'image doit être une chaîne de caractères" })
  imageUrl?: string;
}

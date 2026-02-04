import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '../../enums/event-status.enum';
import { IsFutureDate } from '../../common/decorators/is-future-date.decorator';

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
  @Type(() => Date)
  @IsDate({ message: 'La date doit être valide' })
  @IsNotEmpty({ message: 'La date ne peut pas être vide' })
  @IsFutureDate({ message: 'La date doit être dans le futur' })
  date?: Date;

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

import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  Min,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsFutureDate } from '../../common/decorators/is-future-date.decorator';

export class CreateEventDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  title: string;

  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description est requise' })
  description: string;

  @Type(() => Date)
  @IsDate({ message: 'La date doit être valide' })
  @IsNotEmpty({ message: 'La date est requise' })
  @IsFutureDate({ message: 'La date doit être dans le futur' })
  date: Date;

  @IsString({ message: 'Le lieu doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le lieu est requis' })
  location: string;

  @IsNumber({}, { message: 'La capacité doit être un nombre' })
  @Min(1, { message: 'La capacité doit être au moins 1' })
  capacity: number;

  @IsOptional()
  @IsString({ message: "L'URL de l'image doit être une chaîne de caractères" })
  imageUrl?: string;
}

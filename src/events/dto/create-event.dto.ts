import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  title: string;

  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description est requise' })
  description: string;

  @IsDateString({}, { message: 'La date doit être au format ISO 8601' })
  @IsNotEmpty({ message: 'La date est requise' })
  @Transform(({ value }) => {
    const date = new Date(value);
    const now = new Date();
    if (date < now) {
      throw new Error('La date doit être dans le futur');
    }
    return value;
  })
  date: string;

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

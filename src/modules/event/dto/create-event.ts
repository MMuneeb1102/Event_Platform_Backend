import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // e.g., "2025-07-13"

  @IsString()
  @IsNotEmpty()
  time: string; // e.g., "15:30"

  @IsString()
  @IsNotEmpty()
  location: string;
}

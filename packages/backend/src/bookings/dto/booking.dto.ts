import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { BookingStatus } from '../../storage/storage.types';

export class CreateBookingDto {
  @IsUUID()
  clientId!: string;

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;

  @IsString()
  @MinLength(1)
  room!: string;

  @IsOptional()
  @IsEnum(['held', 'confirmed', 'cancelled'])
  status?: BookingStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  room?: string;

  @IsOptional()
  @IsEnum(['held', 'confirmed', 'cancelled'])
  status?: BookingStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

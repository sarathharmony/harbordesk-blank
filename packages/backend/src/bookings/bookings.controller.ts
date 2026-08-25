import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { Booking } from '../storage/storage.types';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(): Booking[] {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Booking {
    return this.bookingsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBookingDto): Booking {
    return this.bookingsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto): Booking {
    return this.bookingsService.update(id, dto);
  }
}

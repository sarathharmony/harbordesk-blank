import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { Invoice } from '../storage/storage.types';

@Controller('api/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(): Invoice[] {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Invoice {
    return this.invoicesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInvoiceDto): Invoice {
    return this.invoicesService.create(dto);
  }

  @Post('from-booking/:bookingId')
  createFromBooking(@Param('bookingId') bookingId: string): Invoice {
    return this.invoicesService.createFromBooking(bookingId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto): Invoice {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/mark-paid')
  markPaid(@Param('id') id: string): Invoice {
    return this.invoicesService.markPaid(id);
  }
}

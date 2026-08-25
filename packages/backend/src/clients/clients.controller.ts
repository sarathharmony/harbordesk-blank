import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { Client } from '../storage/storage.types';

@Controller('api/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(): Client[] {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Client {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto): Client {
    return this.clientsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto): Client {
    return this.clientsService.update(id, dto);
  }
}

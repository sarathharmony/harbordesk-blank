import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Client } from '../storage/storage.types';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly storage: StorageService) {}

  findAll(): Client[] {
    return this.storage.findAllClients();
  }

  findOne(id: string): Client {
    const client = this.storage.findClient(id);
    if (!client) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return client;
  }

  create(dto: CreateClientDto): Client {
    return this.storage.createClient({
      name: dto.name.trim(),
      email: dto.email.trim(),
      phone: dto.phone?.trim() ?? '',
      notes: dto.notes?.trim() ?? '',
    });
  }

  update(id: string, dto: UpdateClientDto): Client {
    const client = this.storage.updateClient(id, {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.email !== undefined && { email: dto.email.trim() }),
      ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
      ...(dto.notes !== undefined && { notes: dto.notes.trim() }),
    });
    if (!client) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return client;
  }
}

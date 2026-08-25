import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../../storage/storage.types';

export class InvoiceLineItemDto {
  @IsString()
  @MinLength(1)
  description!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];

  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid'])
  status?: InvoiceStatus;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid'])
  status?: InvoiceStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems?: InvoiceLineItemDto[];
}

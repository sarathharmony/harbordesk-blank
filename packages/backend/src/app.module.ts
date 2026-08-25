import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { ClientsModule } from './clients/clients.module';
import { BookingsModule } from './bookings/bookings.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PublicModule } from './public/public.module';

const frontendDist = join(__dirname, '..', '..', 'frontend', 'dist');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: frontendDist,
      exclude: ['/api/(.*)'],
    }),
    StorageModule,
    HealthModule,
    ClientsModule,
    BookingsModule,
    InvoicesModule,
    PublicModule,
  ],
})
export class AppModule {}

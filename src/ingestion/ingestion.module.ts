import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INGESTION_SERVICE',
        transport: Transport.TCP,
        options: { host: 'python-backend', port: 3001 },
      },
    ]),
  ],
  controllers: [IngestionController],
  providers: [IngestionService, PrismaService],
})
export class IngestionModule {}
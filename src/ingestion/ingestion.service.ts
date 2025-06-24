import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';

@Injectable()
export class IngestionService {
  constructor(
    private prisma: PrismaService,
    @Inject('INGESTION_SERVICE') private client: ClientProxy,
  ) {}

  async triggerIngestion(documentId: string, userId: string) {
    // Verify document exists and user has access
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    if (document.ownerId !== userId) {
      throw new NotFoundException('Unauthorized access to document');
    }

    // Create ingestion record
    const ingestion = await this.prisma.ingestion.create({
      data: {
        documentId,
        status: 'PENDING',
      },
    });

    // Emit event to Python backend
    this.client.emit('ingestion_triggered', {
      documentId,
      ingestionId: ingestion.id,
      filePath: document.filePath,
    });

    return ingestion;
  }

  async getIngestionStatus(id: string) {
    const ingestion = await this.prisma.ingestion.findUnique({
      where: { id },
      include: { document: true },
    });
    if (!ingestion) {
      throw new NotFoundException('Ingestion not found');
    }
    return ingestion;
  }

  async getAllIngestions(userId: string, role: string) {
    const where = role === 'Admin' ? {} : { document: { ownerId: userId } };
    return this.prisma.ingestion.findMany({
      where,
      include: { document: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateIngestionStatus(id: string, status: string) {
    return this.prisma.ingestion.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }
}
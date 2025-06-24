import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';

class UpdateStatusDto {
  status: string;
}

@ApiTags('ingestion')
@Controller('ingestion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger/:documentId')
  @Roles(Role.Editor, Role.Admin)
  @ApiOperation({ summary: 'Trigger ingestion for a document' })
  @ApiResponse({ status: 201, description: 'Ingestion triggered successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  triggerIngestion(@Param('documentId') documentId: string, @Request() req) {
    return this.ingestionService.triggerIngestion(documentId, req.user.sub);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get ingestion status by ID' })
  @ApiResponse({ status: 200, description: 'Ingestion status retrieved' })
  @ApiResponse({ status: 404, description: 'Ingestion not found' })
  getIngestionStatus(@Param('id') id: string) {
    return this.ingestionService.getIngestionStatus(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingestion processes' })
  @ApiResponse({ status: 200, description: 'List of ingestion processes' })
  getAllIngestions(@Request() req) {
    return this.ingestionService.getAllIngestions(req.user.sub, req.user.role);
  }

  @Post('webhook/status/:id')
  @ApiOperation({ summary: 'Webhook to update ingestion status' })
  @ApiResponse({ status: 200, description: 'Ingestion status updated' })
  updateIngestionStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.ingestionService.updateIngestionStatus(id, updateStatusDto.status);
  }
}
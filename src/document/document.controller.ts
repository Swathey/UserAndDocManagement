import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // All authenticated users can create documents
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    // Set the owner ID from the authenticated user
    createDocumentDto.ownerId = req.user.id;
    return await this.documentService.create(createDocumentDto);
  }

  // Admins can see all documents, editors and viewers see permitted docs
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    // If admin, return all documents
    // For other roles, we would filter by access
    if (req.user.role === Role.Admin) {
      return await this.documentService.findAll();
    } else {
      // For now, just return documents owned by the user
      // You could expand this to include shared documents
      return await this.documentService.findAllByUserId(req.user.id);
    }
  }
  // All authenticated users can view documents they have access to
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // In a real app, you would check if the user has access to this document
    const result = await this.documentService.findOne(id);
    
    // If user is not an admin, verify ownership or access rights
    if (req.user.role !== Role.Admin && result.document) {
      if (result.document.ownerId !== req.user.id) {
        // Check if document is shared with this user (not implemented)
        return {
          message: 'You do not have permission to access this document',
        };
      }
    }
    
    return result;
  }

  // Users can update their own documents, admins can update any
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req
  ) {
    // First check if user can access this document
    const document = await this.documentService.findOne(id);
    
    // If user is not admin, check if they own the document
    if (req.user.role !== Role.Admin && document.document) {
      if (document.document.ownerId !== req.user.id) {
        return {
          message: 'You do not have permission to update this document',
        };
      }
    }
    
    // Set updatedBy field if available in DTO
    if ('updatedBy' in updateDocumentDto) {
      updateDocumentDto.updatedBy = req.user.id;
    }
    
    return await this.documentService.update(id, updateDocumentDto);
  }
  // Users can delete their own documents, admins can delete any
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // First check if user can access this document
    const document = await this.documentService.findOne(id);
    
    // If user is not admin, check if they own the document
    if (req.user.role !== Role.Admin && document.document) {
      if (document.document.ownerId !== req.user.id) {
        return {
          message: 'You do not have permission to delete this document',
        };
      }
    }
    
    return await this.documentService.remove(id);
  }
}

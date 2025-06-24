import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'prisma/prisma.service';
@Injectable()
export class DocumentService {
 
   constructor(private prisma: PrismaService) {}
 

  async create(createDocumentDto: CreateDocumentDto) {
    try{
    const { title, content, ownerId } = createDocumentDto;
    const newDocument = await this.prisma.document.create({data: createDocumentDto})
    return {
      message: 'Document created successfully',
      document: newDocument,
    };
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}
  async findAll() {
    try{
    const allDocuments = await this.prisma.document.findMany() 
    return {
      message: 'Documents retrieved successfully',
      documents: allDocuments,
    }
  }
  catch(error) {
    console.error('Error finding documents:', error);
    throw new Error('Failed to retrieve documents');
  }
}

  async findAllByUserId(userId: string) {
    try {
      const documents = await this.prisma.document.findMany({
        where: { ownerId: userId },
      });
      
      return {
        message: 'Documents retrieved successfully',
        documents: documents,
      };
    } catch (error) {
      console.error('Error finding documents by user ID:', error);
      throw new Error('Failed to retrieve documents');
    }
  }
async findOne(id: string) {
  try {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      return {
        message: `Document with ID ${id} not found`,
      };
    }
    
    return {
      message: `Document with ID ${id} found successfully`,
      document: document,
    };
  } catch (error) {
    return {
      message: `Error finding document with ID ${id}`,
      error: error.message,
    };
  }
}

async update(id: string, updateDocumentDto: UpdateDocumentDto) {
  try {
    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });
    
    return {
      message: `Document with ID ${id} updated successfully`,
      document: updatedDocument,
    };
  } catch (err) {
    return {
      message: `Error updating document with ID ${id}`,
      error: err.message,
    };
  }
}

async remove(id: string) {
  try {
    const deletedDocument = await this.prisma.document.delete({
      where: { id },
    });
    
    return {
      message: `Document with ID ${id} deleted successfully`,
      document: deletedDocument,
    };
  } catch (err) {
    // If document not found, Prisma throws a specific error
    if (err.code === 'P2025') {
      return {
        message: `Document with ID ${id} not found`,
      };
    }
    
    return {
      message: `Error deleting document with ID ${id}`,
      error: err.message,
    };
  }
}
}
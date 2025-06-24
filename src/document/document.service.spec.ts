import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

// Mock the PrismaService
const mockPrismaService = {
  document: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DocumentService', () => {
  let service: DocumentService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a new document successfully', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        content: 'This is a test document',
        ownerId: 'user-id-1',
        filePath: '/path/to/document.pdf',
      };
      
      const mockCreatedDocument = {
        id: 'doc-id-1',
        title: 'Test Document',
        content: 'This is a test document',
        ownerId: 'user-id-1',
        filePath: '/path/to/document.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.document.create.mockResolvedValue(mockCreatedDocument);
      
      const result = await service.create(createDocumentDto);
      
      expect(result).toEqual({
        message: 'Document created successfully',
        document: mockCreatedDocument,
      });
      
      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: createDocumentDto,
      });
    });    it('should handle errors during document creation', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        content: 'This is a test document',
        ownerId: 'user-id-1',
        filePath: '/path/to/document.pdf',
      };
      
      const error = new Error('Failed to create document');
      mockPrismaService.document.create.mockRejectedValue(error);
      
      await expect(service.create(createDocumentDto)).rejects.toThrow(
        'Failed to create document'
      );
      
      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: createDocumentDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all documents', async () => {      const mockDocuments = [
        {
          id: 'doc-id-1',
          title: 'Document 1',
          content: 'Content 1',
          ownerId: 'user-id-1',
          filePath: '/path/to/document1.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'doc-id-2',
          title: 'Document 2',
          content: 'Content 2',
          ownerId: 'user-id-2',
          filePath: '/path/to/document2.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      mockPrismaService.document.findMany.mockResolvedValue(mockDocuments);
      
      const result = await service.findAll();
      
      expect(result).toEqual({
        message: 'Documents retrieved successfully',
        documents: mockDocuments,
      });
      
      expect(mockPrismaService.document.findMany).toHaveBeenCalled();
    });

    it('should handle errors when retrieving all documents', async () => {
      const error = new Error('Failed to retrieve documents');
      mockPrismaService.document.findMany.mockRejectedValue(error);
      
      await expect(service.findAll()).rejects.toThrow(
        'Failed to retrieve documents'
      );
    });
  });

  describe('findAllByUserId', () => {
    it('should return all documents for a specific user', async () => {
      const userId = 'user-id-1';      const mockDocuments = [
        {
          id: 'doc-id-1',
          title: 'Document 1',
          content: 'Content 1',
          ownerId: userId,
          filePath: '/path/to/document1.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'doc-id-3',
          title: 'Document 3',
          content: 'Content 3',
          ownerId: userId,
          filePath: '/path/to/document3.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      mockPrismaService.document.findMany.mockResolvedValue(mockDocuments);
      
      const result = await service.findAllByUserId(userId);
      
      expect(result).toEqual({
        message: 'Documents retrieved successfully',
        documents: mockDocuments,
      });
      
      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
      });
    });

    it('should handle errors when retrieving user documents', async () => {
      const userId = 'user-id-1';
      const error = new Error('Failed to retrieve documents');
      mockPrismaService.document.findMany.mockRejectedValue(error);
      
      await expect(service.findAllByUserId(userId)).rejects.toThrow(
        'Failed to retrieve documents'
      );
    });
  });

  describe('findOne', () => {
    it('should find a document by id', async () => {
      const documentId = 'doc-id-1';      const mockDocument = {
        id: documentId,
        title: 'Test Document',
        content: 'This is a test document',
        ownerId: 'user-id-1',
        filePath: '/path/to/test-document.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
      
      const result = await service.findOne(documentId);
      
      expect(result).toEqual({
        message: `Document with ID ${documentId} found successfully`,
        document: mockDocument,
      });
      
      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: documentId },
      });
    });

    it('should return a message when document is not found', async () => {
      const documentId = 'nonexistent-id';
      mockPrismaService.document.findUnique.mockResolvedValue(null);
      
      const result = await service.findOne(documentId);
      
      expect(result).toEqual({
        message: `Document with ID ${documentId} not found`,
      });
    });

    it('should handle errors when retrieving a document', async () => {
      const documentId = 'doc-id-1';
      const error = new Error('Database error');
      mockPrismaService.document.findUnique.mockRejectedValue(error);
      
      const result = await service.findOne(documentId);
      
      expect(result).toEqual({
        message: `Error finding document with ID ${documentId}`,
        error: 'Database error',
      });
    });
  });

  describe('update', () => {
    it('should update a document successfully', async () => {
      const documentId = 'doc-id-1';
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };
        const mockUpdatedDocument = {
        id: documentId,
        title: 'Updated Title',
        content: 'Updated content',
        ownerId: 'user-id-1',
        filePath: '/path/to/updated-document.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.document.update.mockResolvedValue(mockUpdatedDocument);
      
      const result = await service.update(documentId, updateDocumentDto);
      
      expect(result).toEqual({
        message: `Document with ID ${documentId} updated successfully`,
        document: mockUpdatedDocument,
      });
      
      expect(mockPrismaService.document.update).toHaveBeenCalledWith({
        where: { id: documentId },
        data: updateDocumentDto,
      });
    });

    it('should handle errors when updating a document', async () => {
      const documentId = 'doc-id-1';
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Title',
      };
      
      const error = new Error('Database error');
      mockPrismaService.document.update.mockRejectedValue(error);
      
      const result = await service.update(documentId, updateDocumentDto);
      
      expect(result).toEqual({
        message: `Error updating document with ID ${documentId}`,
        error: 'Database error',
      });
    });
  });

  describe('remove', () => {
    it('should delete a document successfully', async () => {
      const documentId = 'doc-id-1';      const mockDeletedDocument = {
        id: documentId,
        title: 'Test Document',
        content: 'This is a test document',
        ownerId: 'user-id-1',
        filePath: '/path/to/deleted-document.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.document.delete.mockResolvedValue(mockDeletedDocument);
      
      const result = await service.remove(documentId);
      
      expect(result).toEqual({
        message: `Document with ID ${documentId} deleted successfully`,
        document: mockDeletedDocument,
      });
      
      expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
        where: { id: documentId },
      });
    });

    it('should handle document not found during deletion', async () => {
      const documentId = 'nonexistent-id';
      const error = { code: 'P2025', message: 'Record not found' };
      mockPrismaService.document.delete.mockRejectedValue(error);
      
      const result = await service.remove(documentId);
      
      expect(result).toEqual({
        message: `Document with ID ${documentId} not found`,
      });
    });

    it('should handle other errors during deletion', async () => {
      const documentId = 'doc-id-1';
      const error = new Error('Database error');
      mockPrismaService.document.delete.mockRejectedValue(error);
      
      const result = await service.remove(documentId);
      
      expect(result).toEqual({
        message: `Error deleting document with ID ${documentId}`,
        error: 'Database error',
      });
    });
  });
});

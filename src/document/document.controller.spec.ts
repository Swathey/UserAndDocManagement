import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// Mock the DocumentService
const mockDocumentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllByUserId: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock the JwtAuthGuard
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create a new document with the authenticated user as owner', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        content: 'This is a test document',
        ownerId: '', // This will be set by the controller
        filePath: '/path/to/document.pdf',
      };
      
      const req = {
        user: {
          id: 'user-id-1',
          email: 'test@example.com',
          role: Role.Admin,
        },
      };
        const expectedResult = {
        message: 'Document created successfully',
        document: {
          id: 'doc-id-1',
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1',
          filePath: '/path/to/document.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      
      mockDocumentService.create.mockResolvedValue(expectedResult);
        const result = await controller.create(createDocumentDto, req);
      
      expect(result).toEqual(expectedResult);
      expect(createDocumentDto.ownerId).toBe('user-id-1'); // Check that ownerId was set
      expect(mockDocumentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1',
          filePath: '/path/to/document.pdf',
        })
      );
    });
  });

  describe('findAll', () => {
    it('should return all documents for admin users', async () => {
      const req = {
        user: {
          id: 'user-id-1',
          email: 'admin@example.com',
          role: Role.Admin,
        },
      };
      
      const mockAllDocuments = {
        message: 'Documents retrieved successfully',
        documents: [
          {
            id: 'doc-id-1',
            title: 'Document 1',
            ownerId: 'user-id-1',
          },
          {
            id: 'doc-id-2',
            title: 'Document 2',
            ownerId: 'user-id-2',
          },
        ],
      };
      
      mockDocumentService.findAll.mockResolvedValue(mockAllDocuments);
      
      const result = await controller.findAll(req);
      
      expect(result).toEqual(mockAllDocuments);
      expect(mockDocumentService.findAll).toHaveBeenCalled();
      expect(mockDocumentService.findAllByUserId).not.toHaveBeenCalled();
    });

    it('should return only user documents for non-admin users', async () => {
      const req = {
        user: {
          id: 'user-id-1',
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockUserDocuments = {
        message: 'Documents retrieved successfully',
        documents: [
          {
            id: 'doc-id-1',
            title: 'Document 1',
            ownerId: 'user-id-1',
          },
        ],
      };
      
      mockDocumentService.findAllByUserId.mockResolvedValue(mockUserDocuments);
      
      const result = await controller.findAll(req);
      
      expect(result).toEqual(mockUserDocuments);
      expect(mockDocumentService.findAll).not.toHaveBeenCalled();
      expect(mockDocumentService.findAllByUserId).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('findOne', () => {
    it('should return a document if user is admin', async () => {
      const documentId = 'doc-id-1';
      const req = {
        user: {
          id: 'admin-id',
          email: 'admin@example.com',
          role: Role.Admin,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1',
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      
      const result = await controller.findOne(documentId, req);
      
      expect(result).toEqual(mockDocument);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
    });

    it('should return a document if user is the owner', async () => {
      const documentId = 'doc-id-1';
      const userId = 'user-id-1';
      const req = {
        user: {
          id: userId,
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: userId, // Same as the requesting user
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      
      const result = await controller.findOne(documentId, req);
      
      expect(result).toEqual(mockDocument);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
    });

    it('should deny access if user is not admin or owner', async () => {
      const documentId = 'doc-id-1';
      const req = {
        user: {
          id: 'different-user-id',
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1', // Different from the requesting user
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      
      const result = await controller.findOne(documentId, req);
      
      expect(result).toEqual({
        message: 'You do not have permission to access this document',
      });
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
    });
  });

  describe('update', () => {
    it('should update a document if user is admin', async () => {
      const documentId = 'doc-id-1';
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };
      
      const req = {
        user: {
          id: 'admin-id',
          email: 'admin@example.com',
          role: Role.Admin,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Original Title',
          content: 'Original content',
          ownerId: 'user-id-1',
        },
      };
      
      const mockUpdatedDocument = {
        message: 'Document with ID doc-id-1 updated successfully',
        document: {
          id: documentId,
          title: 'Updated Title',
          content: 'Updated content',
          ownerId: 'user-id-1',
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      mockDocumentService.update.mockResolvedValue(mockUpdatedDocument);
      
      const result = await controller.update(documentId, updateDocumentDto, req);
      
      expect(result).toEqual(mockUpdatedDocument);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.update).toHaveBeenCalledWith(documentId, updateDocumentDto);
    });

    it('should update a document if user is the owner', async () => {
      const documentId = 'doc-id-1';
      const userId = 'user-id-1';
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Title',
      };
      
      const req = {
        user: {
          id: userId,
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Original Title',
          content: 'Original content',
          ownerId: userId, // Same as the requesting user
        },
      };
      
      const mockUpdatedDocument = {
        message: 'Document with ID doc-id-1 updated successfully',
        document: {
          id: documentId,
          title: 'Updated Title',
          content: 'Original content',
          ownerId: userId,
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      mockDocumentService.update.mockResolvedValue(mockUpdatedDocument);
      
      const result = await controller.update(documentId, updateDocumentDto, req);
      
      expect(result).toEqual(mockUpdatedDocument);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.update).toHaveBeenCalledWith(documentId, updateDocumentDto);
    });

    it('should deny update if user is not admin or owner', async () => {
      const documentId = 'doc-id-1';
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Title',
      };
      
      const req = {
        user: {
          id: 'different-user-id',
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Original Title',
          content: 'Original content',
          ownerId: 'user-id-1', // Different from the requesting user
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      
      const result = await controller.update(documentId, updateDocumentDto, req);
      
      expect(result).toEqual({
        message: 'You do not have permission to update this document',
      });
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a document if user is admin', async () => {
      const documentId = 'doc-id-1';
      const req = {
        user: {
          id: 'admin-id',
          email: 'admin@example.com',
          role: Role.Admin,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1',
        },
      };
      
      const mockDeletedDocument = {
        message: 'Document with ID doc-id-1 deleted successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1',
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      mockDocumentService.remove.mockResolvedValue(mockDeletedDocument);
      
      const result = await controller.remove(documentId, req);
      
      expect(result).toEqual(mockDeletedDocument);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.remove).toHaveBeenCalledWith(documentId);
    });

    it('should delete a document if user is the owner', async () => {
      const documentId = 'doc-id-1';
      const userId = 'user-id-1';
      const req = {
        user: {
          id: userId,
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: userId, // Same as the requesting user
        },
      };
      
      const mockDeletedDocument = {
        message: 'Document with ID doc-id-1 deleted successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: userId,
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      mockDocumentService.remove.mockResolvedValue(mockDeletedDocument);
      
      const result = await controller.remove(documentId, req);
      
      expect(result).toEqual(mockDeletedDocument);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.remove).toHaveBeenCalledWith(documentId);
    });

    it('should deny deletion if user is not admin or owner', async () => {
      const documentId = 'doc-id-1';
      const req = {
        user: {
          id: 'different-user-id',
          email: 'user@example.com',
          role: Role.Editor,
        },
      };
      
      const mockDocument = {
        message: 'Document with ID doc-id-1 found successfully',
        document: {
          id: documentId,
          title: 'Test Document',
          content: 'This is a test document',
          ownerId: 'user-id-1', // Different from the requesting user
        },
      };
      
      mockDocumentService.findOne.mockResolvedValue(mockDocument);
      
      const result = await controller.remove(documentId, req);
      
      expect(result).toEqual({
        message: 'You do not have permission to delete this document',
      });
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.remove).not.toHaveBeenCalled();
    });
  });
});

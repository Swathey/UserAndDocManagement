import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock the PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'Admin',
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      
      const result = await service.findByEmail('test@example.com');
      
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      const result = await service.findByEmail('nonexistent@example.com');
      
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        role: Role.Admin,
      };
      
      const hashedPassword = 'hashed-password';
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      
      const mockCreatedUser = {
        id: 'new-id',
        email: 'new@example.com',
        password: hashedPassword,
        role: Role.Admin,
      };
      
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      
      const result = await service.create(createUserDto);
      
      expect(result).toEqual({
        message: 'User created successfully',
        user: mockCreatedUser,
      });
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          password: hashedPassword,
          role: Role.Admin,
        },
      });
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        role: Role.Admin,
      };
      
      const error = new Error('Database error');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));
      mockPrismaService.user.create.mockRejectedValue(error);
      
      const result = await service.create(createUserDto);
      
      expect(result).toEqual({
        message: 'Error creating user',
        error: 'Database error',
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'id1',
          email: 'user1@example.com',
          role: Role.Admin,
          documents: [],
        },
        {
          id: 'id2',
          email: 'user2@example.com',
          role: Role.Editor,
          documents: [],
        },
      ];
      
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      
      const result = await service.findAll();
      
      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          role: true,
          documents: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        role: Role.Admin,
        documents: [],
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      
      const result = await service.findOne('test-id');
      
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        select: {
          id: true,
          email: true,
          role: true,
          documents: true,
        },
      });
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      const result = await service.findOne('nonexistent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        role: Role.Editor,
      };
      
      const mockUpdatedUser = {
        id: 'test-id',
        email: 'updated@example.com',
        role: Role.Editor,
      };
      
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);
      
      const result = await service.update('test-id', updateUserDto);
      
      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const mockDeletedUser = {
        id: 'test-id',
        email: 'test@example.com',
        role: Role.Admin,
      };
      
      mockPrismaService.user.delete.mockResolvedValue(mockDeletedUser);
      
      const result = await service.remove('test-id');
      
      expect(result).toEqual(mockDeletedUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });
});

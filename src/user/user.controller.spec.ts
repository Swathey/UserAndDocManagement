import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// Mock the UserService
const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock the Guards
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: Role.Admin,
      };
      
      const expectedResult = {
        message: 'User created successfully',
        user: {
          id: 'test-id',
          email: 'test@example.com',
          role: Role.Admin,
        },
      };
      
      mockUserService.create.mockResolvedValue(expectedResult);
      
      const result = await controller.create(createUserDto);
      
      expect(result).toEqual(expectedResult);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
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
      
      mockUserService.findAll.mockResolvedValue(expectedUsers);
      
      const result = await controller.findAll();
      
      expect(result).toEqual(expectedUsers);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const expectedUser = {
        id: 'test-id',
        email: 'test@example.com',
        role: Role.Admin,
        documents: [],
      };
      
      mockUserService.findOne.mockResolvedValue(expectedUser);
      
      const result = await controller.findOne('test-id');
      
      expect(result).toEqual(expectedUser);
      expect(mockUserService.findOne).toHaveBeenCalledWith('test-id');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        role: Role.Editor,
      };
      
      const expectedResult = {
        id: 'test-id',
        email: 'updated@example.com',
        role: Role.Editor,
      };
      
      mockUserService.update.mockResolvedValue(expectedResult);
      
      const result = await controller.update('test-id', updateUserDto);
      
      expect(result).toEqual(expectedResult);
      expect(mockUserService.update).toHaveBeenCalledWith('test-id', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const expectedResult = {
        id: 'test-id',
        email: 'test@example.com',
        role: Role.Admin,
      };
      
      mockUserService.remove.mockResolvedValue(expectedResult);
      
      const result = await controller.remove('test-id');
      
      expect(result).toEqual(expectedResult);
      expect(mockUserService.remove).toHaveBeenCalledWith('test-id');
    });
  });
});

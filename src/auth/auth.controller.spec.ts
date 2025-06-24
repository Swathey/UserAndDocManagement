import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

// Mock AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
    .overrideGuard(LocalAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        role: Role.Admin,
      };
      
      const expectedResult = {
        message: 'User registered successfully',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.Admin,
        },
      };
      
      mockAuthService.register.mockResolvedValue(expectedResult);
      
      const result = await controller.register(createUserDto);
      
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const req = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.Admin,
        },
      };
      
      const expectedResult = {
        accessToken: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.Admin,
        },
      };
      
      mockAuthService.login.mockResolvedValue(expectedResult);
      
      const result = await controller.login(req as any);
      
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const expectedResult = {
        message: 'Logged out successfully',
      };
      
      mockAuthService.logout.mockResolvedValue(expectedResult);
      
      const result = await controller.logout();
      
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', () => {
      const req = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.Admin,
        },
      };
      
      const result = controller.getProfile(req as any);
      
      expect(result).toEqual(req.user);
    });
  });
});

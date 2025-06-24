import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

// Mock the UserService
const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'Admin',
      };
      
      mockUserService.findByEmail.mockResolvedValue(user);
      
      const result = await service.validateUser('test@example.com', 'password');
      
      expect(result).toEqual({
        id: 'test-id',
        email: 'test@example.com',
        role: 'Admin',
      });
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      
      const result = await service.validateUser('test@example.com', 'password');
      
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'Admin',
      };
      
      mockUserService.findByEmail.mockResolvedValue(user);
      
      const result = await service.validateUser('test@example.com', 'wrong-password');
      
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        role: 'Admin',
      };
      
      const accessToken = 'test-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);
      
      const result = await service.login(user);
      
      expect(result).toEqual({
        accessToken,
        user: {
          id: 'test-id',
          email: 'test@example.com',
          role: 'Admin',
        },
      });
    });
  });

  describe('register', () => {
    it('should register a new user and return user details without password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
        role: Role.Admin,
      };
      
      const newUser = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'Admin',
      };
      
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        message: 'User created successfully',
        user: newUser,
      });
      
      const result = await service.register(createUserDto);
      
      expect(result).toEqual({
        message: 'User registered successfully',
        user: {
          id: 'test-id',
          email: 'test@example.com',
          role: 'Admin',
        },
      });
    });

    it('should throw an error if user already exists', async () => {
      const createUserDto : CreateUserDto= {
        email: 'test@example.com',
        password: 'password',
        role: Role.Admin,
      };
      
      mockUserService.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });
      
      await expect(service.register(createUserDto)).rejects.toThrow(
        'Registration failed: User with this email already exists',
      );
    });
  });
});

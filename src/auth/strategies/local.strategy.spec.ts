import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object when credentials are valid', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: Role.Admin,
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

      const result = await strategy.validate('test@example.com', 'password');

      expect(result).toEqual(user);
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(strategy.validate('test@example.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'wrong-password');
    });
  });
});

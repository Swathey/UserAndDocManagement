import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: any) {
    debugger;
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      debugger;
      // Check if user exists
      const existingUser = await this.userService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create the user
      const result:any = await this.userService.create(createUserDto);
      
      // Don't return the password
      return {
        message: 'User registered successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async logout() {
    // In a stateless JWT implementation, we don't need to do anything server-side
    // The client simply removes the token
    return {
      message: 'Logged out successfully',
    };
  }
}

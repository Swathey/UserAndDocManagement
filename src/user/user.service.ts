import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  
  async create(createUserDto: CreateUserDto) {
    try {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      const newUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          role: createUserDto.role,
        },
      });
      
      return {
        message: 'User created successfully',
        user: newUser,
      };
    }
    catch(error) {
      return {
        message: 'Error creating user',
        error: error.message,
      };
    }
  }
    
  

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        documents: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        documents: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // If password is being updated, hash it
    // if (updateUserDto.password) {
    //   updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    // }
    
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
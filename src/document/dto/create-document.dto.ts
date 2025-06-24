/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
// import { User } from '../../user/entities/user.entity';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @IsNotEmpty()
  @IsString()
  filePath: string

}

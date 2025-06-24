/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';

export enum DocumentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsDate()
  lastModifiedDate?: Date;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}

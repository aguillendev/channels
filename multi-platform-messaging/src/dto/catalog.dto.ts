import { IsString, IsArray } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class CatalogDto extends BaseMessageDto {
  type = MessageType.CATALOG;

  @IsString()
  catalogId: string;

  @IsString()
  text: string;

  @IsArray()
  productRetailerIds: string[];
}

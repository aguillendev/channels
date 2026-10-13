import { IsString, IsUrl, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';
import { QuickReplyButton } from './quick-reply.dto';

export class CardDto extends BaseMessageDto {
  type = MessageType.CARD;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuickReplyButton)
  buttons?: QuickReplyButton[];
}

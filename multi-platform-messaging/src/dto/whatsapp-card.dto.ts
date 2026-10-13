import { IsString, IsUrl, IsOptional } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class WhatsAppCardDto extends BaseMessageDto {
  type = MessageType.WHATSAPP_CARD;

  @IsString()
  contactName: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  organization?: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class WhatsAppOtpDto extends BaseMessageDto {
  type = MessageType.WHATSAPP_OTP;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  templateName: string;
}

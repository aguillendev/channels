import { IsString, IsUrl } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class CtaDto extends BaseMessageDto {
  type = MessageType.CTA;

  @IsString()
  text: string;

  @IsString()
  buttonText: string;

  @IsUrl()
  url: string;
}

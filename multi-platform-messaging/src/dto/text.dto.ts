import { IsString, IsNotEmpty } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class TextDto extends BaseMessageDto {
  type = MessageType.TEXT;

  @IsString()
  @IsNotEmpty()
  text: string;
}

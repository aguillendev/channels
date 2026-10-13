import { IsEnum, IsDefined } from 'class-validator';
import { MessageType } from '../interfaces/message-types.interface';

export class BaseMessageDto {
  @IsEnum(MessageType)
  @IsDefined()
  type: MessageType;
}

import { IsString, IsObject, IsOptional } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class FlowsDto extends BaseMessageDto {
  type = MessageType.FLOWS;

  @IsString()
  flowId: string;

  @IsString()
  flowToken: string;

  @IsString()
  @IsOptional()
  flowAction?: string;

  @IsObject()
  @IsOptional()
  flowData?: any;
}

import { IsString, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class QuickReplyButton {
  @IsString()
  id: string;

  @IsString()
  title: string;
}

export class QuickReplyDto extends BaseMessageDto {
  type = MessageType.QUICK_REPLY;

  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => QuickReplyButton)
  buttons: QuickReplyButton[];
}

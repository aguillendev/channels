import { IsString, IsUrl, IsOptional } from 'class-validator';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class MediaDto extends BaseMessageDto {
  type = MessageType.MEDIA;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  caption?: string;

  @IsString()
  @IsOptional()
  filename?: string;

  // Can be image, video, audio, document
  @IsString()
  @IsOptional()
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

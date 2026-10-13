import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';
import { CardDto } from './card.dto';

export class CarouselDto extends BaseMessageDto {
  type = MessageType.CAROUSEL;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  cards: CardDto[];
}

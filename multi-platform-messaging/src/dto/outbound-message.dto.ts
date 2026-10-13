import { IsString, IsEnum, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlatformType } from '../interfaces/message-types.interface';
import { BaseMessageDto } from './base-message.dto';

import { TextDto } from './text.dto';
import { MediaDto } from './media.dto';
import { WhatsAppOtpDto } from './whatsapp-otp.dto';
import { QuickReplyDto } from './quick-reply.dto';
import { ListPickerDto } from './list-picker.dto';
import { CtaDto } from './cta.dto';
import { CardDto } from './card.dto';
import { CarouselDto } from './carousel.dto';
import { CatalogDto } from './catalog.dto';
import { WhatsAppCardDto } from './whatsapp-card.dto';
import { FlowsDto } from './flows.dto';

export class OutboundMessageDto {
  @IsString()
  to: string;

  @IsEnum(PlatformType)
  platform: PlatformType;

  @IsDefined()
  @ValidateNested()
  @Type(() => BaseMessageDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: TextDto, name: 'text' },
        { value: MediaDto, name: 'media' },
        { value: WhatsAppOtpDto, name: 'whatsapp_otp' },
        { value: QuickReplyDto, name: 'quick_reply' },
        { value: ListPickerDto, name: 'list_picker' },
        { value: CtaDto, name: 'cta' },
        { value: CardDto, name: 'card' },
        { value: CarouselDto, name: 'carousel' },
        { value: CatalogDto, name: 'catalog' },
        { value: WhatsAppCardDto, name: 'whatsapp_card' },
        { value: FlowsDto, name: 'flows' },
      ],
    },
  })
  payload: any;
}

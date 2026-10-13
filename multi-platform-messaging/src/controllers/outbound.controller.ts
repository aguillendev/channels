import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MessagingService } from '../module/messaging.service';
import { OutboundMessageDto } from '../dto/outbound-message.dto';

@Controller('messaging/outbound')
export class OutboundController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Param('provider') provider: string,
    @Body() messageDto: OutboundMessageDto
  ) {
    return this.messagingService.sendMessage(provider, messageDto);
  }
}

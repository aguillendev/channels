import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MessagingService } from '../module/messaging.service';

@Controller('messaging/webhooks')
export class InboundController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get(':provider')
  verifyWebhook(
    @Param('provider') provider: string,
    @Query() query: any
  ) {
    return this.messagingService.verifyWebhook(provider, query);
  }

  @Post(':provider')
  receiveWebhook(
    @Param('provider') provider: string,
    @Body() body: any
  ) {
    this.messagingService.normalizeAndEmitWebhook(provider, body);
    return { status: 'EVENT_RECEIVED' };
  }
}

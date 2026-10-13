# Multi-Platform Messaging for NestJS

A modular, extensible, and production-ready NestJS library for sending and receiving multi-platform messages. Currently supports WhatsApp via **Meta Cloud API** and **Twilio**.

## Features
- **Extensible:** Easily add support for Facebook Messenger, Instagram, or SMS.
- **Strongly Typed DTOs:** Out-of-the-box support for complex message types like Quick Replies, List Pickers, Carousels, WhatsApp Cards, Flows, etc.
- **Unified Interface:** Adapters implement the `IMessagingProvider` interface. Your app interacts with the same API regardless of the underlying platform.
- **Inbound Event Normalization:** Automatically transforms raw provider webhooks into unified `IInboundMessage` or `IDeliveryReceipt` objects.
- **Webhook Security:** Built-in NestJS guards to verify webhook challenges.

---

## Installation

```bash
npm install multi-platform-messaging class-validator class-transformer
```

---

## Configuration

Import the `MessagingModule` into your root `AppModule`. You can configure it statically using `forRoot` or dynamically (e.g. to inject configuration variables) using `forRootAsync`.

### Dynamic Configuration (`forRootAsync`)

```typescript
import { Module } from '@nestjs/common';
import {
  MessagingModule,
  MetaWhatsAppAdapter,
  TwilioWhatsAppAdapter
} from 'multi-platform-messaging';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MessagingModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          providers: [
            new MetaWhatsAppAdapter(
              configService.get('META_ACCESS_TOKEN'),
              configService.get('META_PHONE_NUMBER_ID')
            ),
            new TwilioWhatsAppAdapter(
              configService.get('TWILIO_ACCOUNT_SID'),
              configService.get('TWILIO_AUTH_TOKEN'),
              configService.get('TWILIO_FROM_NUMBER')
            )
          ]
        };
      }
    })
  ]
})
export class AppModule {}
```

---

## Sending Messages (Outbound)

Inject the `MessagingService` into your controllers or services to send messages.

```typescript
import { Injectable } from '@nestjs/common';
import {
  MessagingService,
  MessageType,
  PlatformType,
  IOutboundMessage
} from 'multi-platform-messaging';

@Injectable()
export class NotificationService {
  constructor(private readonly messagingService: MessagingService) {}

  async sendTextMessage() {
    const message: IOutboundMessage = {
      to: '1234567890',
      platform: PlatformType.WHATSAPP,
      payload: {
        type: MessageType.TEXT,
        text: 'Hello from NestJS multi-platform messaging!'
      }
    };

    // Send using the Meta WhatsApp provider
    await this.messagingService.sendMessage('meta-whatsapp', message);
  }

  async sendInteractiveMessage() {
    const message: IOutboundMessage = {
      to: '1234567890',
      platform: PlatformType.WHATSAPP,
      payload: {
        type: MessageType.QUICK_REPLY,
        text: 'Are you satisfied with our service?',
        buttons: [
          { id: 'btn_yes', title: 'Yes' },
          { id: 'btn_no', title: 'No' }
        ]
      }
    };

    await this.messagingService.sendMessage('meta-whatsapp', message);
  }
}
```

---

## Receiving Messages (Inbound Webhooks)

You can build endpoints to handle incoming messages or delivery receipts. Use the `normalizer` functions provided by the library to convert varying payload structures into a single unified format.

### Verifying Meta Webhooks

Use the `MetaVerifyGuard` to securely handle Meta's hub challenge during webhook setup.

```typescript
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  MessagingService,
  MetaVerifyGuard,
  IInboundMessage,
  IDeliveryReceipt
} from 'multi-platform-messaging';

@Controller('webhooks/meta')
export class MetaWebhookController {
  constructor(private readonly messagingService: MessagingService) {}

  // 1. Verify Webhook (GET)
  // Protect the route using the MetaVerifyGuard, passing your verify_token
  @Get()
  @UseGuards(new MetaVerifyGuard('my_secret_verify_token'))
  verifyWebhook() {
    // The Guard automatically responds to Meta with the hub.challenge if successful.
  }

  // 2. Receive Messages/Receipts (POST)
  @Post()
  receiveEvent(@Body() rawPayload: any) {
    // Normalize the event
    const events = this.messagingService.normalizeWebhook('meta-whatsapp', rawPayload);

    for (const event of events) {
      if ('status' in event) {
        // It's a delivery receipt
        const receipt = event as IDeliveryReceipt;
        console.log(`Message ${receipt.id} status is now: ${receipt.status}`);
      } else {
        // It's an inbound message
        const message = event as IInboundMessage;
        console.log(`Received message from ${message.from}: `, message.payload);
      }
    }

    // Acknowledge receipt to the provider quickly
    return 'EVENT_RECEIVED';
  }
}
```

---

## Advanced Usage

For validating incoming HTTP requests using the library DTOs, you can use `@Body()` decorators paired with the `ValidationPipe` built into NestJS:

```typescript
import { TextDto, QuickReplyDto } from 'multi-platform-messaging';

// You can use these classes inside your own modules to ensure type safety
// when your frontend or other internal services communicate with your API.
```
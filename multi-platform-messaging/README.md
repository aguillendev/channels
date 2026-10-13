# Multi-Platform Messaging for NestJS

A modular, extensible, and production-ready NestJS library for sending and receiving multi-platform messages. Currently supports WhatsApp via **Meta Cloud API** and **Twilio**.

## Features
- **Extensible:** Easily add support for Facebook Messenger, Instagram, or SMS.
- **Strongly Typed DTOs:** Out-of-the-box support for complex message types like Quick Replies, List Pickers, Carousels, WhatsApp Cards, Flows, etc.
- **Unified Interface:** Adapters implement the `IMessagingProvider` interface. Your app interacts with the same API regardless of the underlying platform.
- **Inbound Event Normalization:** Automatically transforms raw provider webhooks into unified `IInboundMessage` or `IDeliveryReceipt` objects.
- **Built-in Controllers:** The library provides built-in HTTP controllers to instantly receive webhooks and expose an outbound messaging API without writing boilerplate code.

---

## Installation

```bash
npm install multi-platform-messaging class-validator class-transformer rxjs
```

---

## Configuration

Import the `MessagingModule` into your root `AppModule`. You can configure it statically using `forRoot` or dynamically (e.g. to inject configuration variables) using `forRootAsync`.

### Dynamic Configuration with Built-in Controllers

Setting `enableControllers: true` activates the `InboundController` and `OutboundController` out-of-the-box.

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
          enableControllers: true, // Enables /messaging/webhooks and /messaging/outbound routes
          providers: [
            new MetaWhatsAppAdapter(
              configService.get('META_ACCESS_TOKEN'),
              configService.get('META_PHONE_NUMBER_ID'),
              configService.get('META_VERIFY_TOKEN') // Optional for webhook verification
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

## Built-in API Endpoints

When `enableControllers: true` is configured, the library exposes the following endpoints:

### Send a Message (Outbound)
**POST** `/messaging/outbound/:provider`
*(e.g., `POST /messaging/outbound/meta-whatsapp`)*

Body payload (strongly typed using `OutboundMessageDto`):
```json
{
  "to": "1234567890",
  "platform": "whatsapp",
  "payload": {
    "type": "text",
    "text": "Hello world"
  }
}
```

### Webhooks (Inbound)
**GET** `/messaging/webhooks/:provider`
*(Used for Meta hub.challenge verification)*

**POST** `/messaging/webhooks/:provider`
*(Receives events from Meta/Twilio, normalizes them, and emits them internally)*

---

## Listening to Webhooks Internally (RxJS)

If you use the built-in inbound webhook controller, the normalized messages and receipts are emitted using an RxJS `Subject` on the `MessagingService`.

You can listen to them anywhere in your application:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagingService, IInboundMessage, IDeliveryReceipt } from 'multi-platform-messaging';

@Injectable()
export class NotificationListenerService implements OnModuleInit {
  constructor(private readonly messagingService: MessagingService) {}

  onModuleInit() {
    this.messagingService.inboundEvents$.subscribe((event) => {
      if ('status' in event) {
        const receipt = event as IDeliveryReceipt;
        console.log(`Receipt: ${receipt.id} status updated to ${receipt.status}`);
      } else {
        const message = event as IInboundMessage;
        console.log(`New Message from ${message.from}: `, message.payload);
      }
    });
  }
}
```

---

## Advanced: Manual Implementation

If you choose *not* to enable the built-in controllers, you can inject `MessagingService` into your own controllers and use the manual methods.

### Sending manually:
```typescript
await this.messagingService.sendMessage('meta-whatsapp', messageObj);
```

### Receiving manually:
```typescript
const events = this.messagingService.normalizeWebhook('meta-whatsapp', rawPayload);
```

### Verifying manually:
```typescript
const challenge = this.messagingService.verifyWebhook('meta-whatsapp', req.query);
```
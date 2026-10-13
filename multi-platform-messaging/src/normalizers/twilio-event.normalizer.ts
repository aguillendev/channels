import {
  IInboundMessage,
  IDeliveryReceipt
} from '../interfaces/inbound.interface';
import { MessageType, PlatformType, DeliveryStatus } from '../interfaces/message-types.interface';

export class TwilioEventNormalizer {
  static normalize(rawPayload: any): (IInboundMessage | IDeliveryReceipt)[] {
    const results: (IInboundMessage | IDeliveryReceipt)[] = [];

    // Twilio sends form-urlencoded data, which NestJS usually parses into an object
    if (rawPayload.MessageStatus) {
      // It's a status callback
      results.push(this.normalizeStatus(rawPayload));
    } else if (rawPayload.NumMedia || rawPayload.Body) {
      // It's an incoming message
      results.push(this.normalizeMessage(rawPayload));
    }

    return results;
  }

  private static normalizeMessage(message: any): IInboundMessage {
    const platform = message.From.startsWith('whatsapp:') ? PlatformType.WHATSAPP : PlatformType.SMS;
    const from = message.From.replace('whatsapp:', '');

    // Twilio webhooks don't send a timestamp of message creation natively in the same way Meta does.
    // They are received now.
    const timestamp = new Date();

    let type = MessageType.TEXT;
    let payload: any = { type };

    if (parseInt(message.NumMedia, 10) > 0) {
      type = MessageType.MEDIA;
      payload = {
        type,
        mediaUrl: message.MediaUrl0,
        mediaContentType: message.MediaContentType0,
        caption: message.Body
      };
    } else {
      type = MessageType.TEXT;
      payload = { type, text: message.Body };
    }

    return {
      id: message.MessageSid,
      from,
      timestamp,
      platform,
      payload,
      raw: message,
    };
  }

  private static normalizeStatus(status: any): IDeliveryReceipt {
    let deliveryStatus: DeliveryStatus = DeliveryStatus.FAILED;

    switch (status.MessageStatus) {
      case 'sent':
        deliveryStatus = DeliveryStatus.SENT;
        break;
      case 'delivered':
        deliveryStatus = DeliveryStatus.DELIVERED;
        break;
      case 'read':
        deliveryStatus = DeliveryStatus.READ;
        break;
      case 'failed':
      case 'undelivered':
        deliveryStatus = DeliveryStatus.FAILED;
        break;
    }

    const platform = status.To.startsWith('whatsapp:') ? PlatformType.WHATSAPP : PlatformType.SMS;
    const recipientId = status.To.replace('whatsapp:', '');

    return {
      id: status.MessageSid,
      status: deliveryStatus,
      timestamp: new Date(),
      recipientId,
      platform,
      raw: status
    };
  }
}

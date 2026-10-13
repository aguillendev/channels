import {
  IInboundMessage,
  IDeliveryReceipt
} from '../interfaces/inbound.interface';
import { MessageType, PlatformType, DeliveryStatus } from '../interfaces/message-types.interface';

export class MetaEventNormalizer {
  static normalize(rawPayload: any): (IInboundMessage | IDeliveryReceipt)[] {
    const results: (IInboundMessage | IDeliveryReceipt)[] = [];

    if (!rawPayload.entry) return results;

    for (const entry of rawPayload.entry) {
      if (!entry.changes) continue;

      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        if (!value) continue;

        // Process Messages
        if (value.messages) {
          for (const message of value.messages) {
            results.push(this.normalizeMessage(message, value.metadata));
          }
        }

        // Process Statuses (Delivery Receipts)
        if (value.statuses) {
          for (const status of value.statuses) {
            results.push(this.normalizeStatus(status));
          }
        }
      }
    }

    return results;
  }

  private static normalizeMessage(message: any, metadata: any): IInboundMessage {
    const platform = PlatformType.WHATSAPP; // assuming WhatsApp from Meta Cloud API context
    const timestamp = new Date(parseInt(message.timestamp, 10) * 1000);

    let type = MessageType.TEXT;
    let payload: any = { type };

    if (message.type === 'text') {
      type = MessageType.TEXT;
      payload = { type, text: message.text.body };
    } else if (['image', 'video', 'audio', 'document'].includes(message.type)) {
      type = MessageType.MEDIA;
      payload = {
        type,
        mediaType: message.type,
        mediaId: message[message.type].id,
        caption: message[message.type].caption
      };
    } else if (message.type === 'interactive') {
      // Could be quick reply or list picker response
      if (message.interactive.type === 'button_reply') {
        type = MessageType.QUICK_REPLY;
        payload = {
          type,
          buttonId: message.interactive.button_reply.id,
          title: message.interactive.button_reply.title
        };
      } else if (message.interactive.type === 'list_reply') {
        type = MessageType.LIST_PICKER;
        payload = {
          type,
          listId: message.interactive.list_reply.id,
          title: message.interactive.list_reply.title
        };
      } else if (message.interactive.type === 'nfm_reply') { // flows
        type = MessageType.FLOWS;
        payload = {
          type,
          responseJson: message.interactive.nfm_reply.response_json
        };
      }
    }

    return {
      id: message.id,
      from: message.from,
      timestamp,
      platform,
      payload,
      raw: message,
    };
  }

  private static normalizeStatus(status: any): IDeliveryReceipt {
    let deliveryStatus: DeliveryStatus = DeliveryStatus.FAILED;

    switch (status.status) {
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
        deliveryStatus = DeliveryStatus.FAILED;
        break;
    }

    return {
      id: status.id,
      status: deliveryStatus,
      timestamp: new Date(parseInt(status.timestamp, 10) * 1000),
      recipientId: status.recipient_id,
      platform: PlatformType.WHATSAPP,
      raw: status
    };
  }
}

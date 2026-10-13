import { IMessagingProvider } from '../interfaces/provider.interface';
import { IOutboundMessage } from '../interfaces/outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from '../interfaces/inbound.interface';
import { MetaEventNormalizer } from '../normalizers/meta-event.normalizer';
import { MessageType } from '../interfaces/message-types.interface';

export class MetaWhatsAppAdapter implements IMessagingProvider {
  public readonly name = 'meta-whatsapp';

  constructor(
    private readonly accessToken: string,
    private readonly phoneNumberId: string,
    private readonly apiVersion: string = 'v19.0'
  ) {}

  async sendMessage(message: IOutboundMessage): Promise<any> {
    const payload = this.buildMetaPayload(message);

    // In a real implementation, you would use axios/fetch here:
    /*
    const response = await fetch(`https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.json();
    */

    return {
      status: 'simulated_success',
      provider: this.name,
      simulatedPayload: payload
    };
  }

  normalizeInboundEvent(rawPayload: any): (IInboundMessage | IDeliveryReceipt)[] {
    return MetaEventNormalizer.normalize(rawPayload);
  }

  private buildMetaPayload(message: IOutboundMessage): any {
    const base = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to
    };

    switch (message.payload.type) {
      case MessageType.TEXT:
        return {
          ...base,
          type: 'text',
          text: { body: message.payload.text }
        };

      case MessageType.MEDIA:
        const mediaType = message.payload.mediaType || 'image';
        return {
          ...base,
          type: mediaType,
          [mediaType]: {
            link: message.payload.url,
            ...(message.payload.caption && { caption: message.payload.caption })
          }
        };

      case MessageType.WHATSAPP_OTP:
        return {
          ...base,
          type: 'template',
          template: {
            name: message.payload.templateName,
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: message.payload.code }
                ]
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [
                  { type: 'text', text: message.payload.code }
                ]
              }
            ]
          }
        };

      // Add mapping for other types (list picker, quick reply, etc)
      default:
        throw new Error(`Unsupported message type for MetaWhatsAppAdapter: ${message.payload.type}`);
    }
  }
}

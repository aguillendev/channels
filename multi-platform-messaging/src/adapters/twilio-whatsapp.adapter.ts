import { IMessagingProvider } from '../interfaces/provider.interface';
import { IOutboundMessage } from '../interfaces/outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from '../interfaces/inbound.interface';
import { TwilioEventNormalizer } from '../normalizers/twilio-event.normalizer';
import { MessageType } from '../interfaces/message-types.interface';

export class TwilioWhatsAppAdapter implements IMessagingProvider {
  public readonly name = 'twilio-whatsapp';

  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string
  ) {}

  async sendMessage(message: IOutboundMessage): Promise<any> {
    const payload = this.buildTwilioPayload(message);

    // In a real implementation, use twilio SDK:
    /*
    const client = require('twilio')(this.accountSid, this.authToken);
    return await client.messages.create(payload);
    */

    return {
      status: 'simulated_success',
      provider: this.name,
      simulatedPayload: payload
    };
  }

  normalizeInboundEvent(rawPayload: any): (IInboundMessage | IDeliveryReceipt)[] {
    return TwilioEventNormalizer.normalize(rawPayload);
  }

  private buildTwilioPayload(message: IOutboundMessage): any {
    const to = `whatsapp:${message.to}`;
    const from = `whatsapp:${this.fromNumber}`;

    switch (message.payload.type) {
      case MessageType.TEXT:
        return {
          from,
          to,
          body: message.payload.text
        };

      case MessageType.MEDIA:
        return {
          from,
          to,
          body: message.payload.caption || '',
          mediaUrl: [message.payload.url]
        };

      // Other advanced types are mapped to Content Templates in Twilio
      default:
        throw new Error(`Unsupported message type for TwilioWhatsAppAdapter: ${message.payload.type}`);
    }
  }
}

import { IMessagingProvider } from '../interfaces/provider.interface';
import { IOutboundMessage } from '../interfaces/outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from '../interfaces/inbound.interface';
import { TwilioEventNormalizer } from '../normalizers/twilio-event.normalizer';
import { MessageType } from '../interfaces/message-types.interface';
import { InternalServerErrorException, NotAcceptableException } from '@nestjs/common';
import twilio = require('twilio');

export class TwilioWhatsAppAdapter implements IMessagingProvider {
  public readonly name = 'twilio-whatsapp';
  private readonly client: twilio.Twilio;

  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string
  ) {
    this.client = twilio(this.accountSid, this.authToken);
  }

  async sendMessage(message: IOutboundMessage): Promise<any> {
    const payload = this.buildTwilioPayload(message);

    try {
      const response = await this.client.messages.create(payload);
      return {
        status: 'success',
        provider: this.name,
        messageId: response.sid,
        raw: response
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to send message via Twilio: ${error.message}`);
    }
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

      case MessageType.WHATSAPP_CARD:
        // Twilio supports sending contacts via specific templates or vCard media,
        // but for a simple WhatsApp Card we would ideally use Content Templates.
        // As a fallback, we throw if Content Templates aren't used.
        throw new NotAcceptableException(`WHATSAPP_CARD requires pre-approved Twilio Content Templates.`);

      case MessageType.WHATSAPP_OTP:
      case MessageType.QUICK_REPLY:
      case MessageType.LIST_PICKER:
      case MessageType.CTA:
      case MessageType.CARD:
      case MessageType.CAROUSEL:
      case MessageType.CATALOG:
      case MessageType.FLOWS:
        // These advanced Meta types do not have standard generic Twilio counterparts
        // without using Twilio's "Content API" and pre-registered templates (Content SIDs).
        // If the payload provides a contentSid (an extension we can add), we can send it.
        // Otherwise, they are gracefully rejected as they cannot be constructed dynamically like Meta's API.

        if (message.payload.contentSid) {
          return {
            from,
            to,
            contentSid: message.payload.contentSid,
            contentVariables: JSON.stringify(message.payload.contentVariables || {})
          };
        }

        throw new NotAcceptableException(
          `Message type '${message.payload.type}' is advanced and requires a pre-registered Twilio Content Template SID (contentSid).`
        );

      default:
        throw new NotAcceptableException(`Unsupported message type for TwilioWhatsAppAdapter: ${message.payload.type}`);
    }
  }
}

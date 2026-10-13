import { IMessagingProvider } from '../interfaces/provider.interface';
import { IOutboundMessage } from '../interfaces/outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from '../interfaces/inbound.interface';
import { MetaEventNormalizer } from '../normalizers/meta-event.normalizer';
import { MessageType } from '../interfaces/message-types.interface';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';

export class MetaWhatsAppAdapter implements IMessagingProvider {
  public readonly name = 'meta-whatsapp';

  constructor(
    private readonly accessToken: string,
    private readonly phoneNumberId: string,
    private readonly verifyToken?: string,
    private readonly apiVersion: string = 'v19.0'
  ) {}

  async sendMessage(message: IOutboundMessage): Promise<any> {
    const payload = this.buildMetaPayload(message);

    try {
      const response = await fetch(`https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Meta API error: ${JSON.stringify(data)}`);
      }

      return {
        status: 'success',
        provider: this.name,
        messageId: data.messages?.[0]?.id,
        raw: data
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to send message via Meta: ${error.message}`);
    }
  }

  normalizeInboundEvent(rawPayload: any): (IInboundMessage | IDeliveryReceipt)[] {
    return MetaEventNormalizer.normalize(rawPayload);
  }

  handleVerifyWebhook(query: any): string {
    if (!this.verifyToken) {
      throw new Error('Verify token not configured for MetaWhatsAppAdapter');
    }

    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }

    throw new ForbiddenException('Invalid verify token');
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

      case MessageType.QUICK_REPLY:
        return {
          ...base,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: message.payload.text },
            action: {
              buttons: message.payload.buttons.map((b: any) => ({
                type: 'reply',
                reply: { id: b.id, title: b.title }
              }))
            }
          }
        };

      case MessageType.LIST_PICKER:
        return {
          ...base,
          type: 'interactive',
          interactive: {
            type: 'list',
            header: message.payload.title ? { type: 'text', text: message.payload.title } : undefined,
            body: { text: message.payload.text },
            action: {
              button: message.payload.buttonText,
              sections: message.payload.sections.map((s: any) => ({
                title: s.title,
                rows: s.rows.map((r: any) => ({
                  id: r.id,
                  title: r.title,
                  description: r.description
                }))
              }))
            }
          }
        };

      case MessageType.CTA:
        return {
          ...base,
          type: 'interactive',
          interactive: {
            type: 'cta_url',
            body: { text: message.payload.text },
            action: {
              name: 'cta_url',
              parameters: {
                display_text: message.payload.buttonText,
                url: message.payload.url
              }
            }
          }
        };

      case MessageType.CARD:
        // Represented using a single template or media + buttons,
        // typically achieved via template but sticking to interactive here for dynamic content.
        // A simple card (image + title + quick replies)
        return {
          ...base,
          type: 'interactive',
          interactive: {
            type: 'button',
            header: message.payload.imageUrl ? { type: 'image', image: { link: message.payload.imageUrl } } : undefined,
            body: { text: message.payload.title },
            footer: message.payload.subtitle ? { text: message.payload.subtitle } : undefined,
            action: {
              buttons: (message.payload.buttons || []).map((b: any) => ({
                type: 'reply',
                reply: { id: b.id, title: b.title }
              }))
            }
          }
        };

      case MessageType.CAROUSEL:
        // Carousel requires a specific setup for Meta (often via templates),
        // using the interactive carousel format if available or falling back to templates.
        // As of newer APIs, templates are strictly used for carousels.
        return {
          ...base,
          type: 'template',
          template: {
            name: message.payload.templateName || 'carousel_template',
            language: { code: 'en_US' },
            components: [
              {
                type: 'carousel',
                cards: message.payload.cards.map((c: any, index: number) => ({
                  card_index: index,
                  components: [
                    {
                      type: 'header',
                      parameters: [
                        c.imageUrl ? { type: 'image', image: { link: c.imageUrl } } : undefined
                      ].filter(Boolean)
                    },
                    {
                      type: 'body',
                      parameters: [
                        { type: 'text', text: c.title }
                      ]
                    },
                    {
                      type: 'button',
                      sub_type: 'quick_reply',
                      index: '0',
                      parameters: [
                        { type: 'payload', payload: c.buttons?.[0]?.id || `btn_${index}` }
                      ]
                    }
                  ].filter(comp => comp.parameters.length > 0)
                }))
              }
            ]
          }
        };

      case MessageType.CATALOG:
        return {
          ...base,
          type: 'interactive',
          interactive: {
            type: 'catalog_message',
            body: { text: message.payload.text },
            action: {
              name: 'catalog_message',
              parameters: {
                thumbnail_product_retailer_id: message.payload.productRetailerIds[0]
              }
            }
          }
        };

      case MessageType.WHATSAPP_CARD:
        return {
          ...base,
          type: 'contacts',
          contacts: [
            {
              name: {
                formatted_name: message.payload.contactName,
                first_name: message.payload.contactName
              },
              phones: [
                {
                  phone: message.payload.phoneNumber,
                  type: 'WORK'
                }
              ],
              org: message.payload.organization ? { company: message.payload.organization } : undefined
            }
          ]
        };

      case MessageType.FLOWS:
        return {
          ...base,
          type: 'interactive',
          interactive: {
            type: 'flow',
            header: { type: 'text', text: message.payload.text || 'Open Flow' },
            body: { text: message.payload.text || 'Click to continue' },
            action: {
              name: 'flow',
              parameters: {
                flow_message_version: '3',
                flow_token: message.payload.flowToken,
                flow_id: message.payload.flowId,
                flow_cta: message.payload.buttonText || 'Open',
                flow_action: message.payload.flowAction || 'navigate',
                flow_action_payload: {
                  screen: 'START',
                  data: message.payload.flowData || {}
                }
              }
            }
          }
        };

      default:
        throw new Error(`Unsupported message type for MetaWhatsAppAdapter: ${message.payload.type}`);
    }
  }
}

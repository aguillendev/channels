import { MetaEventNormalizer } from './meta-event.normalizer';
import { MessageType, PlatformType } from '../interfaces/message-types.interface';

describe('MetaEventNormalizer', () => {
  it('should normalize a text message', () => {
    const rawPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '106192252156643',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15551234567',
                  phone_number_id: '106192252156643'
                },
                contacts: [
                  {
                    profile: { name: 'John Doe' },
                    wa_id: '1234567890'
                  }
                ],
                messages: [
                  {
                    from: '1234567890',
                    id: 'wamid.HBgLMTIzNDU2Nzg5MBucABCDE12345',
                    timestamp: '1683935222',
                    text: { body: 'Hello world' },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const results = MetaEventNormalizer.normalize(rawPayload);

    expect(results).toHaveLength(1);
    const message: any = results[0];
    expect(message.id).toBe('wamid.HBgLMTIzNDU2Nzg5MBucABCDE12345');
    expect(message.from).toBe('1234567890');
    expect(message.platform).toBe(PlatformType.WHATSAPP);
    expect(message.payload.type).toBe(MessageType.TEXT);
    expect(message.payload.text).toBe('Hello world');
  });

  it('should normalize a delivery status receipt', () => {
    const rawPayload = {
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                statuses: [
                  {
                    id: 'wamid.HBgLMTIzNDU2Nzg5MBucABCDE12345',
                    status: 'delivered',
                    timestamp: '1683935230',
                    recipient_id: '1234567890'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const results = MetaEventNormalizer.normalize(rawPayload);

    expect(results).toHaveLength(1);
    const receipt: any = results[0];
    expect(receipt.id).toBe('wamid.HBgLMTIzNDU2Nzg5MBucABCDE12345');
    expect(receipt.status).toBe('delivered');
    expect(receipt.recipientId).toBe('1234567890');
    expect(receipt.platform).toBe(PlatformType.WHATSAPP);
  });
});

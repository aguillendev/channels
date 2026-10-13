import { IOutboundMessage } from './outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from './inbound.interface';

export interface IMessagingProvider {
  /**
   * The name or identifier of the provider adapter.
   */
  readonly name: string;

  /**
   * Sends a message through the provider.
   * @param message The unified outbound message
   * @returns The provider's response, often containing the sent message ID.
   */
  sendMessage(message: IOutboundMessage): Promise<any>;

  /**
   * Normalizes an incoming webhook payload into a unified format.
   * Providers may send arrays of messages or receipts in one payload.
   * @param rawPayload The raw incoming webhook body
   */
  normalizeInboundEvent(rawPayload: any): (IInboundMessage | IDeliveryReceipt)[];

  /**
   * Optional method to handle webhook verification challenges (e.g. Meta hub.challenge)
   * @param query The parsed query string object from the GET request
   * @returns The challenge response string, or throws an error if invalid
   */
  handleVerifyWebhook?(query: any): string;
}

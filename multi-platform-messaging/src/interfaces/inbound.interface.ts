import { MessageType, PlatformType, DeliveryStatus } from './message-types.interface';

export interface IInboundMessagePayload {
  type: MessageType;
  [key: string]: any;
}

export interface IInboundMessage {
  id: string; // Unique message ID
  from: string; // Sender identifier
  timestamp: Date; // When it was received
  platform: PlatformType;
  payload: IInboundMessagePayload;
  raw?: any; // The original payload from the provider, for debugging
}

export interface IDeliveryReceipt {
  id: string; // Message ID this relates to
  status: DeliveryStatus;
  timestamp: Date;
  recipientId: string;
  platform: PlatformType;
  raw?: any;
}

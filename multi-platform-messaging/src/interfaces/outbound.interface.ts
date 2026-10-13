import { MessageType, PlatformType } from './message-types.interface';

export interface IOutboundMessagePayload {
  type: MessageType;
  [key: string]: any; // Allow extensibility for specific message types
}

export interface IOutboundMessage {
  to: string; // The destination identifier (e.g. phone number)
  platform: PlatformType; // Target platform
  payload: IOutboundMessagePayload; // The unified message payload
}

import { Injectable, Inject } from '@nestjs/common';
import { IMessagingProvider } from '../interfaces/provider.interface';
import { IOutboundMessage } from '../interfaces/outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from '../interfaces/inbound.interface';

export const MESSAGING_PROVIDERS = 'MESSAGING_PROVIDERS';

@Injectable()
export class MessagingService {
  private providers: Map<string, IMessagingProvider> = new Map();

  constructor(
    @Inject(MESSAGING_PROVIDERS) providers: IMessagingProvider[]
  ) {
    providers.forEach(p => this.providers.set(p.name, p));
  }

  getProvider(name: string): IMessagingProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Messaging provider ${name} not found`);
    }
    return provider;
  }

  async sendMessage(providerName: string, message: IOutboundMessage): Promise<any> {
    const provider = this.getProvider(providerName);
    return provider.sendMessage(message);
  }

  normalizeWebhook(providerName: string, rawPayload: any): (IInboundMessage | IDeliveryReceipt)[] {
    const provider = this.getProvider(providerName);
    return provider.normalizeInboundEvent(rawPayload);
  }
}

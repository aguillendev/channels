import { Injectable, Inject } from '@nestjs/common';
import { Subject } from 'rxjs';
import { IMessagingProvider } from '../interfaces/provider.interface';
import { IOutboundMessage } from '../interfaces/outbound.interface';
import { IInboundMessage, IDeliveryReceipt } from '../interfaces/inbound.interface';

export const MESSAGING_PROVIDERS = 'MESSAGING_PROVIDERS';

@Injectable()
export class MessagingService {
  private providers: Map<string, IMessagingProvider> = new Map();
  public readonly inboundEvents$ = new Subject<IInboundMessage | IDeliveryReceipt>();

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

  normalizeAndEmitWebhook(providerName: string, rawPayload: any): void {
    const provider = this.getProvider(providerName);
    const events = provider.normalizeInboundEvent(rawPayload);

    events.forEach(event => {
      this.inboundEvents$.next(event);
    });
  }

  verifyWebhook(providerName: string, query: any): string {
    const provider = this.getProvider(providerName);
    if (provider.handleVerifyWebhook) {
      return provider.handleVerifyWebhook(query);
    }
    throw new Error(`Provider ${providerName} does not support webhook verification.`);
  }
}

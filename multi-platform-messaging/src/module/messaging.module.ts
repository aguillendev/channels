import { Module, DynamicModule, Provider } from '@nestjs/common';
import { MessagingService, MESSAGING_PROVIDERS } from './messaging.service';
import { IMessagingProvider } from '../interfaces/provider.interface';
import { InboundController } from '../controllers/inbound.controller';
import { OutboundController } from '../controllers/outbound.controller';

export interface MessagingModuleOptions {
  providers: IMessagingProvider[];
  enableControllers?: boolean;
}

export interface MessagingModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<MessagingModuleOptions> | MessagingModuleOptions;
  inject?: any[];
}

@Module({})
export class MessagingModule {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const controllers = options.enableControllers ? [InboundController, OutboundController] : [];

    return {
      module: MessagingModule,
      controllers,
      providers: [
        {
          provide: MESSAGING_PROVIDERS,
          useValue: options.providers
        },
        MessagingService
      ],
      exports: [MessagingService]
    };
  }

  static forRootAsync(options: MessagingModuleAsyncOptions): DynamicModule {
    const providersProvider: Provider = {
      provide: MESSAGING_PROVIDERS,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        return config.providers;
      },
      inject: options.inject || [],
    };

    return {
      module: MessagingModule,
      imports: options.imports || [],
      providers: [providersProvider, MessagingService],
      exports: [MessagingService]
    };
  }
}

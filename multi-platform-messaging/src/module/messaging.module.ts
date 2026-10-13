import { Module, DynamicModule, Provider } from '@nestjs/common';
import { MessagingService, MESSAGING_PROVIDERS } from './messaging.service';
import { IMessagingProvider } from '../interfaces/provider.interface';

export interface MessagingModuleOptions {
  providers: IMessagingProvider[];
}

export interface MessagingModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<MessagingModuleOptions> | MessagingModuleOptions;
  inject?: any[];
}

@Module({})
export class MessagingModule {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    return {
      module: MessagingModule,
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

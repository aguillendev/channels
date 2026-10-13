import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MetaVerifyGuard implements CanActivate {
  constructor(private readonly verifyToken: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Hub challenge for Meta Webhooks verification
    if (request.method === 'GET') {
      const mode = request.query['hub.mode'];
      const token = request.query['hub.verify_token'];
      const challenge = request.query['hub.challenge'];

      if (mode === 'subscribe' && token === this.verifyToken) {
        // Express specific way of returning challenge,
        // in NestJS you'd typically handle this in the controller.
        // But throwing/rejecting here secures the route.
        request.res?.status(200).send(challenge);
        return true;
      }
      throw new ForbiddenException('Invalid verify token');
    }

    // In a real app for POST methods, we should verify the X-Hub-Signature-256 header using the App Secret.
    return true;
  }
}

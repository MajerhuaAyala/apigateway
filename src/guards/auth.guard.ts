import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { SERVICE_NAME } from '../config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(SERVICE_NAME) private client: ClientKafka) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }

      const response = await firstValueFrom(
        this.client.send('auth.verify.user', token),
      );
      return !!response;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

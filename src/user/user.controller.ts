import { Controller, Get, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(@Inject('ACTION_SERVICE') private client: ClientKafka) {}

  @Get('me')
  async getMe() {
    console.log('peticion user controller');
    return new Promise((resolve) => {
      this.client.send('user', {}).subscribe((result: string) => {
        resolve(result);
      });
    });
  }
}

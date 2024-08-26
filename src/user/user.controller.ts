import { Controller, Get, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(@Inject('FIBO_SERVICE') private client: ClientKafka) {}

  @Get('me')
  async getMe() {
    console.log('peticion user controller');
    return new Promise((resolve) => {
      this.client.send('user', {}).subscribe((result: string) => {
        console.log('>>>>>>>>>>>>> ', result);
        resolve(result);
      });
    });
  }
}

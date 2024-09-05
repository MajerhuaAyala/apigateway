import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { AuthGuard } from '../guards/auth.guard';
import { catchError } from 'rxjs';
import { Admin, Kafka } from 'kafkajs';
import { UserRegisterDto } from './dto/user-register.dto';

@Controller('user')
export class UserController {
  private admin: Admin;
  constructor(@Inject('ACTION_SERVICE') private client: ClientKafka) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe() {
    console.log('peticion user controller');
    return new Promise((resolve) => {
      this.client.send('user', { num: 10 }).subscribe((result: string) => {
        resolve(result);
      });
    });
  }

  @Get('jwt')
  async getJwt() {
    return new Promise((resolve) => {
      this.client.send('jwt', {}).subscribe((result: string) => {
        resolve(result);
      });
    });
  }

  @Post('registerUser')
  async registerUser(@Body() registerUserDto: UserRegisterDto) {
    return this.client.send('user.register.user', registerUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  async onModuleInit() {
    const services = ['user', 'jwt', 'auth.verify.user', 'user.register.user'];

    for (const service of services) {
      this.client.subscribeToResponseOf(service);
    }

    const kafka = new Kafka({
      clientId: 'auction-app',
      brokers: ['localhost:9092'],
    });

    this.admin = kafka.admin();
    const topics = await this.admin.listTopics();

    const topicList = [];
    for (const service of services) {
      if (!topics.includes(service)) {
        topicList.push({
          topic: service,
          numPartitions: 10,
          replicationFactor: 1,
        });
      }

      if (!topics.includes(`${service}.reply`)) {
        topicList.push({
          topic: `${service}.reply`,
          numPartitions: 10,
          replicationFactor: 1,
        });
      }
    }

    if (topicList.length) {
      await this.admin.createTopics({
        topics: topicList,
      });
    }
  }
}

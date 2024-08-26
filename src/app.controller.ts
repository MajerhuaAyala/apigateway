import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { Admin, Kafka } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class AppController {
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
    console.log('get jwt');
    return new Promise((resolve) => {
      this.client.send('jwt', {}).subscribe((result: string) => {
        resolve(result);
      });
    });
  }

  async onModuleInit() {
    const services = ['user', 'jwt', 'auth.verify.user'];

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

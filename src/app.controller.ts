import { Controller, Get, Inject } from '@nestjs/common';
import { Admin, Kafka } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class AppController {
  private admin: Admin;

  constructor(@Inject('FIBO_SERVICE') private client: ClientKafka) {}

  @Get('me')
  async getMe() {
    console.log('peticion user controller');
    return new Promise((resolve) => {
      this.client.send('user', { num: 10 }).subscribe((result: string) => {
        console.log('>>>>>>>>>>>>> ', result);
        resolve(result);
      });
    });
  }

  async onModuleInit() {
    const services = ['user'];

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

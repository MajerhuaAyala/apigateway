import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BROKERS, CLIENT_ID, CONSUMER_GROUP_ID, SERVICE_NAME } from '../config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICE_NAME,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: CLIENT_ID,
            brokers: BROKERS,
          },
          consumer: {
            groupId: CONSUMER_GROUP_ID,
          },
        },
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: SERVICE_NAME,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: CLIENT_ID,
            brokers: BROKERS,
          },
          consumer: {
            groupId: CONSUMER_GROUP_ID,
          },
        },
      },
    ]),
  ],
})
export class KafkaModule {}

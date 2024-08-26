import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { KafkaModule } from './transport/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [AppController],
})
export class AppModule {}

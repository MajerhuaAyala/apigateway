import { Module } from '@nestjs/common';
import { KafkaModule } from './transport/kafka.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [KafkaModule, UserModule],
})
export class AppModule {}

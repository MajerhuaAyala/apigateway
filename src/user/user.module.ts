import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { KafkaModule } from '../transport/kafka.module';

@Module({
  controllers: [UserController],
  imports: [KafkaModule],
})
export class UserModule {}

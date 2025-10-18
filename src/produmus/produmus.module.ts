import { Module } from '@nestjs/common';
import { ProdumusService } from './produmus.service';
import { ProdumusController } from './produmus.controller';
import { OrdersService } from 'src/order/order.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [ProdumusController],
  providers: [ProdumusService, OrdersService, UsersService],
  exports: [ProdumusService, UsersService]
})
export class ProdumusModule {}
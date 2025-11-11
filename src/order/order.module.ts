import { Module } from "@nestjs/common";
import { OrdersController } from "./order.controller";
import { OrdersService } from "./order.service";
import { ProdumusModule } from "src/produmus/produmus.module";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [ProdumusModule],  
  exports: [OrdersService],
})
export class OrdersModule {}

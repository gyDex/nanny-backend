import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProdumusModule } from './produmus/produmus.module';
import { OrdersModule } from './order/order.module';
import { AudioController } from './supabase/audio.controller';
import { SupabaseService } from './supabase/supabase.service';
import { UploadController } from './supabase/upload.controller';
import { FileController } from './supabase/file.controller';
import { PaymentController } from './payment/payment.controller';
import { PaymentModule } from './payment/payment.module';
import { PaymentService } from './payment/payment.service';
import { ApplicationsController } from './application/applications.controller';
import { ApplicationsService } from './application/applications.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HttpModule,
    UsersModule,
    AuthModule,
    ProdumusModule,
    OrdersModule,
    PaymentModule,
  ],
  controllers: [AudioController, UploadController, FileController, PaymentController, ApplicationsController],
  providers: [SupabaseService, PaymentService, ApplicationsService], 
})

export class AppModule  {

}
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({ 
    imports: [ConfigModule, HttpModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
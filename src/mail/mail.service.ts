import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';


@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
        await this.resend.emails.send({
            from: 'Service Nanny <support@servicenanny.ru>',
            to: to,
            subject: subject,
            html: html,
        });
    } catch (error) {
        throw error;    
    }
  }
}

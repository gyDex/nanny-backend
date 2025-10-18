import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ProdumusService } from './produmus.service';

@Controller('payment')
export class ProdumusController {
  constructor(private readonly produmusService: ProdumusService) {}

  @Post('callback')
  @HttpCode(200)
  async handleCallback(@Body() body: any, @Headers() headers: any) {
    return this.produmusService.handleCallback(body, headers);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from 'src/auth/strategies/guards/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly service: ApplicationsService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete('/nanny/:id')
  // @UseGuards(JwtAuthGuard)
  async deleteNanny(@Param('id') id: string) {
    console.log('Deleting nanny with ID:', id);
    console.log('ID type:', typeof id);

    return this.service.deleteNanny(id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: number,
    @Body() dto: { status: 'approved' | 'rejected' },
  ) {
    return this.service.updateStatus(id, dto.status);
  }
}
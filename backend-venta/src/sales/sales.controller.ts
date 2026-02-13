import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Create sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get all sales' })
  @ApiResponse({ status: 200, description: 'Return all sales' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Return sale' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get('number/:saleNumber')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get sale by number' })
  @ApiResponse({ status: 200, description: 'Return sale' })
  findByNumber(@Param('saleNumber') saleNumber: string) {
    return this.salesService.findByNumber(saleNumber);
  }

  @Get('customer/:customerId')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get sales by customer' })
  @ApiResponse({ status: 200, description: 'Return sales' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.salesService.findByCustomer(customerId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sale' })
  @ApiResponse({ status: 204, description: 'Sale deleted successfully' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  @Patch(':id/complete')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Complete sale' })
  @ApiResponse({ status: 200, description: 'Sale completed successfully' })
  complete(@Param('id') id: string, @Request() req) {
    return this.salesService.complete(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Cancel sale' })
  @ApiResponse({ status: 200, description: 'Sale cancelled successfully' })
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }

  @Patch(':id/payment')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Add payment to sale' })
  @ApiResponse({ status: 200, description: 'Payment added successfully' })
  addPayment(@Param('id') id: string, @Body('amount') amount: number) {
    return this.salesService.addPayment(id, amount);
  }
}
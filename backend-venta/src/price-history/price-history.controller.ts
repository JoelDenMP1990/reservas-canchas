import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PriceHistoryService } from './price-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Price History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('price-history')
export class PriceHistoryController {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Get('last-price')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get last price for customer and product' })
  @ApiResponse({ status: 200, description: 'Return last price' })
  getLastPrice(@Query('customerId') customerId: string, @Query('productId') productId: string) {
    return this.priceHistoryService.getLastPrice(customerId, productId);
  }

  @Get('customer/:customerId')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get price history for customer' })
  @ApiResponse({ status: 200, description: 'Return customer price history' })
  getCustomerHistory(@Param('customerId') customerId: string) {
    return this.priceHistoryService.getCustomerHistory(customerId);
  }

  @Get('product/:productId')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get price history for product' })
  @ApiResponse({ status: 200, description: 'Return product price history' })
  getProductHistory(@Param('productId') productId: string) {
    return this.priceHistoryService.getProductHistory(productId);
  }
}
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get dashboard overview' })
  @ApiResponse({ status: 200, description: 'Return dashboard overview' })
  async getOverview(@Request() req) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getOverview(userId);
  }

  @Get('sales-metrics')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get sales metrics' })
  @ApiResponse({ status: 200, description: 'Return sales metrics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getSalesMetrics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getSalesMetrics(userId, start, end);
  }

  @Get('top-products')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiResponse({ status: 200, description: 'Return top products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopProducts(@Request() req, @Query('limit') limit?: number) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getTopProducts(userId, limit ? +limit : 10);
  }

  @Get('top-customers')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get top customers' })
  @ApiResponse({ status: 200, description: 'Return top customers' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopCustomers(@Request() req, @Query('limit') limit?: number) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getTopCustomers(userId, limit ? +limit : 10);
  }

  @Get('sales-by-month')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get sales by month' })
  @ApiResponse({ status: 200, description: 'Return monthly sales' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getSalesByMonth(@Request() req, @Query('year') year?: number) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getSalesByMonth(userId, year ? +year : new Date().getFullYear());
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiResponse({ status: 200, description: 'Return low stock products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLowStockProducts(@Query('limit') limit?: number) {
    return this.dashboardService.getLowStockProducts(limit ? +limit : 20);
  }

  @Get('recent-sales')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get recent sales' })
  @ApiResponse({ status: 200, description: 'Return recent sales' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentSales(@Request() req, @Query('limit') limit?: number) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getRecentSales(userId, limit ? +limit : 10);
  }

  @Get('pending-payments')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get pending payments' })
  @ApiResponse({ status: 200, description: 'Return pending payments' })
  async getPendingPayments(@Request() req) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getPendingPayments(userId);
  }

  @Get('proforma-stats')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get proforma statistics' })
  @ApiResponse({ status: 200, description: 'Return proforma stats' })
  async getProformaStats(@Request() req) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getProformaStats(userId);
  }

  @Get('sales-by-status')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get sales by status' })
  @ApiResponse({ status: 200, description: 'Return sales by status' })
  async getSalesByStatus(@Request() req) {
    const userId = req.user.role === Role.SELLER ? req.user.userId : undefined;
    return this.dashboardService.getSalesByStatus(userId);
  }
}
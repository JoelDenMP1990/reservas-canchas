import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create inventory for product' })
  @ApiResponse({ status: 201, description: 'Inventory created successfully' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get all inventory' })
  @ApiResponse({ status: 200, description: 'Return all inventory' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiResponse({ status: 200, description: 'Return low stock items' })
  getLowStock(@Query('minStock') minStock?: number) {
    return this.inventoryService.getLowStock(minStock);
  }

  @Get('product/:productId')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get inventory by product' })
  @ApiResponse({ status: 200, description: 'Return inventory' })
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get inventory by ID' })
  @ApiResponse({ status: 200, description: 'Return inventory' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch('add/:productId')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Add stock to product' })
  @ApiResponse({ status: 200, description: 'Stock added successfully' })
  addStock(@Param('productId') productId: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.addStock(productId, updateInventoryDto.quantity);
  }

  @Patch('subtract/:productId')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Subtract stock from product' })
  @ApiResponse({ status: 200, description: 'Stock subtracted successfully' })
  subtractStock(@Param('productId') productId: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.subtractStock(productId, updateInventoryDto.quantity);
  }

  @Patch('adjust/:productId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Adjust stock to exact quantity' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  adjustStock(@Param('productId') productId: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.adjustStock(productId, updateInventoryDto.quantity);
  }
}
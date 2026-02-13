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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Return product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('code/:code')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get product by code' })
  @ApiResponse({ status: 200, description: 'Return product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findByCode(@Param('code') code: string) {
    return this.productsService.findByCode(code);
  }

  @Get('category/:category')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, description: 'Return products' })
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore deleted product' })
  @ApiResponse({ status: 200, description: 'Product restored successfully' })
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Deactivate product' })
  @ApiResponse({ status: 200, description: 'Product deactivated successfully' })
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Activate product' })
  @ApiResponse({ status: 200, description: 'Product activated successfully' })
  activate(@Param('id') id: string) {
    return this.productsService.activate(id);
  }
}
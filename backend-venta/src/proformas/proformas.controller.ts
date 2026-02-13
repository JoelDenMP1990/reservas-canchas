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
import { ProformasService } from './proformas.service';
import { CreateProformaDto } from './dto/create-proforma.dto';
import { UpdateProformaDto } from './dto/update-proforma.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Proformas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proformas')
export class ProformasController {
  constructor(private readonly proformasService: ProformasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Create proforma' })
  @ApiResponse({ status: 201, description: 'Proforma created successfully' })
  create(@Body() createProformaDto: CreateProformaDto, @Request() req) {
    return this.proformasService.create(createProformaDto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get all proformas' })
  @ApiResponse({ status: 200, description: 'Return all proformas' })
  findAll() {
    return this.proformasService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get proforma by ID' })
  @ApiResponse({ status: 200, description: 'Return proforma' })
  findOne(@Param('id') id: string) {
    return this.proformasService.findOne(id);
  }

  @Get('number/:proformaNumber')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get proforma by number' })
  @ApiResponse({ status: 200, description: 'Return proforma' })
  findByNumber(@Param('proformaNumber') proformaNumber: string) {
    return this.proformasService.findByNumber(proformaNumber);
  }

  @Get('customer/:customerId')
  @Roles(Role.ADMIN, Role.SELLER, Role.VIEWER)
  @ApiOperation({ summary: 'Get proformas by customer' })
  @ApiResponse({ status: 200, description: 'Return proformas' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.proformasService.findByCustomer(customerId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Update proforma' })
  @ApiResponse({ status: 200, description: 'Proforma updated successfully' })
  update(@Param('id') id: string, @Body() updateProformaDto: UpdateProformaDto) {
    return this.proformasService.update(id, updateProformaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete proforma' })
  @ApiResponse({ status: 204, description: 'Proforma deleted successfully' })
  remove(@Param('id') id: string) {
    return this.proformasService.remove(id);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve proforma' })
  @ApiResponse({ status: 200, description: 'Proforma approved successfully' })
  approve(@Param('id') id: string, @Request() req) {
    return this.proformasService.approve(id, req.user.userId);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reject proforma' })
  @ApiResponse({ status: 200, description: 'Proforma rejected successfully' })
  reject(@Param('id') id: string) {
    return this.proformasService.reject(id);
  }

  @Patch(':id/convert')
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Convert proforma to sale' })
  @ApiResponse({ status: 200, description: 'Proforma converted successfully' })
  convert(@Param('id') id: string) {
    return this.proformasService.convert(id);
  }
}
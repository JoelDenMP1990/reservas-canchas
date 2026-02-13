import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({ status: 200, description: 'Return audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('limit') limit?: number) {
    return this.auditService.findAll(limit ? +limit : 100);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiResponse({ status: 200, description: 'Return user audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.auditService.findByUser(userId, limit ? +limit : 100);
  }

  @Get('table/:tableName')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by table' })
  @ApiResponse({ status: 200, description: 'Return table audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByTable(@Param('tableName') tableName: string, @Query('limit') limit?: number) {
    return this.auditService.findByTable(tableName, limit ? +limit : 100);
  }

  @Get('record/:tableName/:recordId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by record' })
  @ApiResponse({ status: 200, description: 'Return record audit logs' })
  findByRecord(@Param('tableName') tableName: string, @Param('recordId') recordId: string) {
    return this.auditService.findByRecord(tableName, recordId);
  }

  @Get('action/:action')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by action' })
  @ApiResponse({ status: 200, description: 'Return action audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByAction(@Param('action') action: string, @Query('limit') limit?: number) {
    return this.auditService.findByAction(action, limit ? +limit : 100);
  }
}
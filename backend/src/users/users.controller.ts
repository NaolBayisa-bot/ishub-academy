import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@ishub/shared';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.MAIN_ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/status')
  @Roles(Role.MAIN_ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto);
  }

  @Patch(':id/role')
  @Roles(Role.MAIN_ADMIN)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: Role; approvedCategoryId?: number },
  ) {
    return this.usersService.updateRole(id, body);
  }
}

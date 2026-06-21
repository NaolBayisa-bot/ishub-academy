import { Controller, Get, Post, Patch, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@ishub/shared';

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @Roles(Role.STUDENT)
  getProgress(@Request() req) {
    return this.progressService.getProgress(req.user.userId);
  }

  @Post('complete/:lessonId')
  @Roles(Role.STUDENT)
  markComplete(@Request() req, @Param('lessonId') lessonId: string) {
    return this.progressService.markComplete(req.user.userId, parseInt(lessonId, 10));
  }

  @Patch('complete/:lessonId')
  @Roles(Role.STUDENT)
  toggleComplete(@Request() req, @Param('lessonId') lessonId: string) {
    return this.progressService.markComplete(req.user.userId, parseInt(lessonId, 10));
  }
}
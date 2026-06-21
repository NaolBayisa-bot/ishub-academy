import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@ishub/shared';

@Controller('trainings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  @Roles(Role.CATEGORY_ADMIN)
  findAll(@Request() req) {
    return this.trainingsService.findAll(req.user.userId, req.user.role);
  }

  @Get('category')
  @Roles(Role.STUDENT)
  findForStudent(@Request() req) {
    return this.trainingsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.trainingsService.findOne(parseInt(id, 10), req.user.userId, req.user.role);
  }

  @Post()
  @Roles(Role.CATEGORY_ADMIN)
  create(@Request() req, @Body() body: { title: string; description: string; thumbnail?: string; difficulty: string; categoryId: number }) {
    return this.trainingsService.create({
      ...body,
      difficulty: body.difficulty as any,
      createdById: req.user.userId,
    });
  }

  @Patch(':id')
  @Roles(Role.CATEGORY_ADMIN)
  update(@Request() req, @Param('id') id: string, @Body() body: { title?: string; description?: string; thumbnail?: string; difficulty?: string }) {
    return this.trainingsService.update(parseInt(id, 10), req.user.userId, {
      ...body,
      ...(body.difficulty !== undefined && { difficulty: body.difficulty as any }),
    });
  }

  @Patch(':id/status')
  @Roles(Role.CATEGORY_ADMIN)
  updateStatus(@Request() req, @Param('id') id: string, @Body() body: { status: string }) {
    return this.trainingsService.updateStatus(parseInt(id, 10), req.user.userId, body.status as any);
  }

  @Post(':trainingId/modules')
  @Roles(Role.CATEGORY_ADMIN)
  createModule(@Request() req, @Param('trainingId') trainingId: string, @Body() body: { title: string; description?: string; order?: number }) {
    return this.trainingsService.createModule(parseInt(trainingId, 10), req.user.userId, body);
  }

  @Patch('modules/:id')
  @Roles(Role.CATEGORY_ADMIN)
  updateModule(@Request() req, @Param('id') id: string, @Body() body: { title?: string; description?: string; order?: number }) {
    return this.trainingsService.updateModule(parseInt(id, 10), req.user.userId, body);
  }

  @Delete('modules/:id')
  @Roles(Role.CATEGORY_ADMIN)
  deleteModule(@Request() req, @Param('id') id: string) {
    return this.trainingsService.deleteModule(parseInt(id, 10), req.user.userId);
  }

  @Post('modules/:moduleId/lessons')
  @Roles(Role.CATEGORY_ADMIN)
  createLesson(@Request() req, @Param('moduleId') moduleId: string, @Body() body: { title: string; content: string; imageUrl?: string; order?: number }) {
    return this.trainingsService.createLesson(parseInt(moduleId, 10), req.user.userId, body);
  }

  @Patch('lessons/:id')
  @Roles(Role.CATEGORY_ADMIN)
  updateLesson(@Request() req, @Param('id') id: string, @Body() body: { title?: string; content?: string; imageUrl?: string; order?: number }) {
    return this.trainingsService.updateLesson(parseInt(id, 10), req.user.userId, body);
  }

  @Delete('lessons/:id')
  @Roles(Role.CATEGORY_ADMIN)
  deleteLesson(@Request() req, @Param('id') id: string) {
    return this.trainingsService.deleteLesson(parseInt(id, 10), req.user.userId);
  }
}
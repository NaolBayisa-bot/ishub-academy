import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request, UseInterceptors,
  UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ResourcesService } from './resources.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@ishub/shared';

const resourceFileInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: join(__dirname, '..', '..', 'uploads', 'resources'),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // Category Admin: create category-level resource (file upload)
  @Post('category/:categoryId')
  @Roles(Role.CATEGORY_ADMIN)
  @UseInterceptors(resourceFileInterceptor)
  createCategoryResource(
    @Request() req,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: { title: string; linkUrl?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.createCategoryResource(req.user.userId, categoryId, body, file);
  }

  // Category Admin: create training-level resource (file upload)
  @Post('training/:trainingId')
  @Roles(Role.CATEGORY_ADMIN)
  @UseInterceptors(resourceFileInterceptor)
  createTrainingResource(
    @Request() req,
    @Param('trainingId', ParseIntPipe) trainingId: number,
    @Body() body: { title: string; linkUrl?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.createTrainingResource(req.user.userId, trainingId, body, file);
  }

  // Category Admin: update resource (title/linkUrl only)
  @Patch(':id')
  @Roles(Role.CATEGORY_ADMIN)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; linkUrl?: string },
  ) {
    return this.resourcesService.update(id, req.user.userId, body);
  }

  // Category Admin: delete resource
  @Delete(':id')
  @Roles(Role.CATEGORY_ADMIN)
  delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.delete(id, req.user.userId);
  }

  // Student: list category resources
  @Get('category/:categoryId')
  @Roles(Role.STUDENT, Role.CATEGORY_ADMIN)
  getCategoryResources(
    @Request() req,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.resourcesService.getCategoryResources(categoryId, req.user.userId, req.user.role);
  }

  // Student: list training resources
  @Get('training/:trainingId')
  @Roles(Role.STUDENT, Role.CATEGORY_ADMIN)
  getTrainingResources(
    @Request() req,
    @Param('trainingId', ParseIntPipe) trainingId: number,
  ) {
    return this.resourcesService.getTrainingResources(trainingId, req.user.userId, req.user.role);
  }
}
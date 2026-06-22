import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@ishub/shared';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyCategoryAdmin(userId: number, categoryId: number) {
    const admin = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { approvedCategoryId: true, role: true },
    });
    if (admin?.role !== Role.CATEGORY_ADMIN) throw new ForbiddenException('Only category admins can manage resources');
    if (admin.approvedCategoryId !== categoryId) throw new ForbiddenException('You can only manage resources in your own category');
    return admin;
  }

  async createCategoryResource(
    userId: number,
    categoryId: number,
    body: { title: string; linkUrl?: string },
    file?: Express.Multer.File,
  ) {
    await this.verifyCategoryAdmin(userId, categoryId);

    if (!file && !body.linkUrl) {
      throw new BadRequestException('Either a file or a link URL must be provided');
    }
    if (file && body.linkUrl) {
      throw new BadRequestException('Provide either a file or a link URL, not both');
    }

    const fileUrl = file ? `/uploads/resources/${file.filename}` : null;

    return this.prisma.resource.create({
      data: {
        title: body.title,
        type: 'CATEGORY' as any,
        fileUrl,
        linkUrl: body.linkUrl || null,
        categoryId,
        createdById: userId,
      },
      include: {
        category: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async createTrainingResource(
    userId: number,
    trainingId: number,
    body: { title: string; linkUrl?: string },
    file?: Express.Multer.File,
  ) {
    const training = await this.prisma.training.findUnique({ where: { id: trainingId }, select: { categoryId: true, createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only add resources to your own trainings');

    if (!file && !body.linkUrl) {
      throw new BadRequestException('Either a file or a link URL must be provided');
    }
    if (file && body.linkUrl) {
      throw new BadRequestException('Provide either a file or a link URL, not both');
    }

    const fileUrl = file ? `/uploads/resources/${file.filename}` : null;

    return this.prisma.resource.create({
      data: {
        title: body.title,
        type: 'TRAINING' as any,
        fileUrl,
        linkUrl: body.linkUrl || null,
        categoryId: training.categoryId,
        trainingId,
        createdById: userId,
      },
      include: {
        training: { select: { id: true, title: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: number, userId: number, body: { title?: string; linkUrl?: string }) {
    const resource = await this.prisma.resource.findUnique({ where: { id }, include: { category: { select: { id: true } } } });
    if (!resource) throw new NotFoundException('Resource not found');
    await this.verifyCategoryAdmin(userId, resource.categoryId);

    return this.prisma.resource.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl }),
      },
      include: {
        category: { select: { id: true, name: true } },
        training: { select: { id: true, title: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: number, userId: number) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');
    await this.verifyCategoryAdmin(userId, resource.categoryId);

    // Delete the file from disk if it exists
    if (resource.fileUrl) {
      const filePath = join(__dirname, '..', '..', resource.fileUrl);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }

    await this.prisma.resource.delete({ where: { id } });
    return { success: true };
  }

  async getCategoryResources(categoryId: number, userId: number, role: Role) {
    if (role === Role.STUDENT) {
      const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
      if (student?.approvedCategoryId !== categoryId) throw new ForbiddenException('You can only view resources in your own category');
    }

    return this.prisma.resource.findMany({
      where: { categoryId, type: 'CATEGORY' as any },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrainingResources(trainingId: number, userId: number, role: Role) {
    const training = await this.prisma.training.findUnique({ where: { id: trainingId }, select: { categoryId: true, status: true } });
    if (!training) throw new NotFoundException('Training not found');

    if (role === Role.STUDENT) {
      const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
      if (student?.approvedCategoryId !== training.categoryId) throw new ForbiddenException('Training not available for your category');
    }

    return this.prisma.resource.findMany({
      where: { trainingId, type: 'TRAINING' as any },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
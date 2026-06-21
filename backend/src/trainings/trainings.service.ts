import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Difficulty, TrainingStatus, Role } from '@ishub/shared';

@Injectable()
export class TrainingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number, role: Role) {
    if (role === Role.CATEGORY_ADMIN) {
      const admin = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
      if (!admin?.approvedCategoryId) return [];
      return this.prisma.training.findMany({
        where: { categoryId: admin.approvedCategoryId },
        include: { category: true, createdBy: { select: { id: true, firstName: true, lastName: true } }, modules: { include: { lessons: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
    if (!student?.approvedCategoryId) return [];
    return this.prisma.training.findMany({
      where: { categoryId: student.approvedCategoryId, status: TrainingStatus.PUBLISHED },
      include: {
        category: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number, role: Role) {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: { category: true, createdBy: { select: { id: true, firstName: true, lastName: true } }, modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } } },
    });
    if (!training) throw new NotFoundException('Training not found');
    if (role === Role.CATEGORY_ADMIN) {
      const admin = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
      if (training.categoryId !== admin?.approvedCategoryId) throw new ForbiddenException('You can only view trainings in your own category');
      return training;
    }
    if (training.status !== TrainingStatus.PUBLISHED) throw new ForbiddenException('Training not available');
    const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
    if (training.categoryId !== student?.approvedCategoryId) throw new ForbiddenException('Training not available for your category');
    return training;
  }

  async create(data: { title: string; description: string; thumbnail?: string | null; difficulty: Difficulty; categoryId: number; createdById: number }) {
    const admin = await this.prisma.user.findUnique({ where: { id: data.createdById }, select: { approvedCategoryId: true, role: true } });
    if (admin?.role !== Role.CATEGORY_ADMIN) throw new ForbiddenException('Only category admins can create trainings');
    if (data.categoryId !== admin.approvedCategoryId) throw new ForbiddenException('You can only create trainings in your own category');
    return this.prisma.training.create({
      data: { title: data.title, description: data.description, thumbnail: data.thumbnail ?? null, difficulty: data.difficulty, status: TrainingStatus.DRAFT, categoryId: data.categoryId, createdById: data.createdById, updatedAt: new Date() },
      include: { category: true, modules: true },
    });
  }

  async update(id: number, userId: number, data: { title?: string; description?: string; thumbnail?: string | null; difficulty?: Difficulty }) {
    const training = await this.prisma.training.findUnique({ where: { id }, select: { categoryId: true, createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only edit your own trainings');
    return this.prisma.training.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        updatedAt: new Date(),
      },
      include: { category: true, modules: true },
    });
  }

  async updateStatus(id: number, userId: number, status: TrainingStatus) {
    const training = await this.prisma.training.findUnique({ where: { id }, select: { categoryId: true, createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only update your own trainings');
    return this.prisma.training.update({ where: { id }, data: { status, updatedAt: new Date() }, include: { category: true, modules: true } });
  }

  async createModule(trainingId: number, userId: number, body: { title: string; description?: string; order?: number }) {
    const training = await this.prisma.training.findUnique({ where: { id: trainingId }, select: { createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only add modules to your own trainings');
    return this.prisma.module.create({ data: { title: body.title, description: body.description ?? null, order: body.order ?? 0, trainingId, updatedAt: new Date() } });
  }

  async updateModule(id: number, userId: number, body: { title?: string; description?: string; order?: number }) {
    const module = await this.prisma.module.findUnique({ where: { id: id }, select: { training: { select: { createdById: true } } } });
    if (!module) throw new NotFoundException('Module not found');
    if (module.training.createdById !== userId) throw new ForbiddenException('You can only edit modules in your own trainings');
    return this.prisma.module.update({ where: { id }, data: { ...body, description: body.description ?? undefined } });
  }

  async deleteModule(id: number, userId: number) {
    const module = await this.prisma.module.findUnique({ where: { id }, select: { training: { select: { createdById: true } } } });
    if (!module) throw new NotFoundException('Module not found');
    if (module.training.createdById !== userId) throw new ForbiddenException('You can only delete modules in your own trainings');
    await this.prisma.module.delete({ where: { id } });
    return { success: true };
  }

  async createLesson(moduleId: number, userId: number, body: { title: string; content: string; imageUrl?: string; order?: number }) {
    const module = await this.prisma.module.findUnique({ where: { id: moduleId }, select: { training: { select: { createdById: true } } } });
    if (!module) throw new NotFoundException('Module not found');
    if (module.training.createdById !== userId) throw new ForbiddenException('You can only add lessons to your own trainings');
    return this.prisma.lesson.create({ data: { title: body.title, content: body.content, imageUrl: body.imageUrl ?? null, order: body.order ?? 0, moduleId, updatedAt: new Date() } });
  }

  async updateLesson(id: number, userId: number, body: { title?: string; content?: string; imageUrl?: string; order?: number }) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, select: { module: { select: { training: { select: { createdById: true } } } } } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.module.training.createdById !== userId) throw new ForbiddenException('You can only edit lessons in your own trainings');
    return this.prisma.lesson.update({ where: { id }, data: { ...body, imageUrl: body.imageUrl ?? undefined } });
  }

  async deleteLesson(id: number, userId: number) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, select: { module: { select: { training: { select: { createdById: true } } } } } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.module.training.createdById !== userId) throw new ForbiddenException('You can only delete lessons in your own trainings');
    await this.prisma.lesson.delete({ where: { id } });
    return { success: true };
  }
}
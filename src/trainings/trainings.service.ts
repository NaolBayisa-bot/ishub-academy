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
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      });
    }
    const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { approvedCategoryId: true } });
    if (!student?.approvedCategoryId) return [];
    const trainings = await this.prisma.training.findMany({
      where: { categoryId: student.approvedCategoryId, status: TrainingStatus.PUBLISHED },
      include: {
        category: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return this.computeLockStateForStudent(trainings, userId);
  }

  private async computeLockStateForStudent(trainings: any[], userId: number) {
    const results: any[] = [];
    for (const training of trainings) {
      const { locked, lockReason } = await this.getLockState(training.id, userId, training);
      results.push({ ...training, locked, lockReason });
    }
    return results;
  }

  async getLockState(trainingId: number, userId: number, training?: any): Promise<{ locked: boolean; lockReason: string | null }> {
    if (!training) {
      training = await this.prisma.training.findUnique({ where: { id: trainingId } });
    }
    if (!training) return { locked: true, lockReason: 'Training not found' };
    if (training.status !== 'PUBLISHED') return { locked: true, lockReason: 'Training not available' };

    if (training.unlockType === 'OPEN') {
      return { locked: false, lockReason: null };
    }

    if (training.unlockType === 'SEQUENTIAL') {
      // Find previous training in same category with lower order
      const previous = await this.prisma.training.findFirst({
        where: {
          categoryId: training.categoryId,
          order: { lt: training.order },
          status: 'PUBLISHED',
        },
        orderBy: { order: 'desc' },
        include: {
          modules: {
            include: { lessons: true },
          },
        },
      });
      if (!previous) {
        // First in sequence — no prerequisite
        return { locked: false, lockReason: null };
      }
      // Check if student has completed all lessons in the previous training
      const allPreviousLessons = previous.modules.flatMap((m) => m.lessons);
      if (allPreviousLessons.length === 0) return { locked: false, lockReason: null };

      const completedCount = await this.prisma.lessonCompletion.count({
        where: {
          userId,
          lessonId: { in: allPreviousLessons.map((l) => l.id) },
        },
      });
      if (completedCount >= allPreviousLessons.length) {
        return { locked: false, lockReason: null };
      }
      return { locked: true, lockReason: `Complete "${previous.title}" to unlock this training.` };
    }

    if (training.unlockType === 'MANUAL') {
      const grant = await this.prisma.trainingAccessGrant.findUnique({
        where: { trainingId_userId: { trainingId: training.id, userId } },
      });
      if (grant) return { locked: false, lockReason: null };
      return { locked: true, lockReason: 'Awaiting admin access grant.' };
    }

    return { locked: false, lockReason: null };
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

  async updateOrder(id: number, userId: number, order: number) {
    const training = await this.prisma.training.findUnique({ where: { id }, select: { createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only edit your own trainings');
    return this.prisma.training.update({ where: { id }, data: { order, updatedAt: new Date() } });
  }

  async updateUnlockType(id: number, userId: number, unlockType: string) {
    const training = await this.prisma.training.findUnique({ where: { id }, select: { createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only edit your own trainings');
    return this.prisma.training.update({ where: { id }, data: { unlockType: unlockType as any, updatedAt: new Date() } });
  }

  async getAccessGrants(trainingId: number, userId: number) {
    const training = await this.prisma.training.findUnique({ where: { id: trainingId }, select: { createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== userId) throw new ForbiddenException('You can only manage your own trainings');
    return this.prisma.trainingAccessGrant.findMany({
      where: { trainingId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        grantedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async grantAccess(trainingId: number, adminUserId: number, studentUserId: number) {
    const training = await this.prisma.training.findUnique({ where: { id: trainingId }, select: { createdById: true, categoryId: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== adminUserId) throw new ForbiddenException('You can only manage your own trainings');

    // Verify student belongs to same category
    const student = await this.prisma.user.findUnique({ where: { id: studentUserId }, select: { approvedCategoryId: true, role: true } });
    if (!student || student.role !== 'STUDENT') throw new NotFoundException('Student not found');
    if (student.approvedCategoryId !== training.categoryId) throw new ForbiddenException('Student is not in your category');

    const existing = await this.prisma.trainingAccessGrant.findUnique({
      where: { trainingId_userId: { trainingId, userId: studentUserId } },
    });
    if (existing) return existing;

    return this.prisma.trainingAccessGrant.create({
      data: {
        trainingId,
        userId: studentUserId,
        grantedById: adminUserId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async revokeAccess(trainingId: number, adminUserId: number, grantId: number) {
    const training = await this.prisma.training.findUnique({ where: { id: trainingId }, select: { createdById: true } });
    if (!training) throw new NotFoundException('Training not found');
    if (training.createdById !== adminUserId) throw new ForbiddenException('You can only manage your own trainings');

    const grant = await this.prisma.trainingAccessGrant.findUnique({ where: { id: grantId } });
    if (!grant || grant.trainingId !== trainingId) throw new NotFoundException('Access grant not found');

    await this.prisma.trainingAccessGrant.delete({ where: { id: grantId } });
    return { success: true };
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
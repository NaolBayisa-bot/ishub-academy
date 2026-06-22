import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingStatus, Role } from '@ishub/shared';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(userId: number) {
    // Get all published trainings for student's approved category
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { approvedCategoryId: true },
    });
    if (!student?.approvedCategoryId) return [];

    const trainings = await this.prisma.training.findMany({
      where: {
        categoryId: student.approvedCategoryId,
        status: TrainingStatus.PUBLISHED,
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const progress: { trainingId: number; trainingTitle: string; totalLessons: number; completedLessons: number; progressPercent: number }[] = [];
    for (const training of trainings) {
      const allLessons = training.modules.flatMap((m) => m.lessons);
      const totalLessons = allLessons.length;

      const completedCount = await this.prisma.lessonCompletion.count({
        where: {
          userId,
          lessonId: { in: allLessons.map((l) => l.id) },
        },
      });

      progress.push({
        trainingId: training.id,
        trainingTitle: training.title,
        totalLessons,
        completedLessons: completedCount,
        progressPercent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      });
    }

    return progress;
  }

  async markComplete(userId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            training: true,
          },
        },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Check student has access to this training's category
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { approvedCategoryId: true, role: true },
    });
    if (!student?.approvedCategoryId) throw new ForbiddenException('No category assigned');
    if (student.role !== Role.STUDENT) throw new ForbiddenException('Only students can mark lessons');
    if (lesson.module.training.categoryId !== student.approvedCategoryId) {
      throw new ForbiddenException('Training not available for your category');
    }

    // Upsert completion record
    const existing = await this.prisma.lessonCompletion.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existing) return { alreadyCompleted: true };

    await this.prisma.lessonCompletion.create({
      data: {
        userId,
        lessonId,
        trainingId: lesson.module.trainingId,
      },
    });

    return { alreadyCompleted: false };
  }

  async unmarkComplete(userId: number, lessonId: number) {
    const deleted = await this.prisma.lessonCompletion.deleteMany({
      where: { userId, lessonId },
    });
    return { deleted: deleted.count > 0 };
  }
}
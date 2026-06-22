import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@ishub/shared';

@Injectable()
export class CategoryAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only applies to CATEGORY_ADMIN role
    if (user.role !== Role.CATEGORY_ADMIN) {
      return true;
    }

    // Get trainingId from params (supports both :id and :trainingId)
    const trainingId =
      parseInt(request.params.id, 10) ||
      parseInt(request.params.trainingId, 10);

    if (!trainingId || isNaN(trainingId)) {
      // No training context — allow (controller will handle validation)
      return true;
    }

    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      select: { categoryId: true },
    });

    if (!training) {
      throw new ForbiddenException('Training not found');
    }

    // Verify the training belongs to the admin's approved category
    if (training.categoryId !== user.approvedCategoryId) {
      throw new ForbiddenException(
        'You can only manage trainings in your own category',
      );
    }

    return true;
  }
}
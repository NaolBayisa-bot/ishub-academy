import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user.dto';
import { UserStatus, Role } from '@ishub/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        preferredCategory: true,
        approvedCategory: true,
      },
    });
  }

  async updateStatus(id: number, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        status: dto.status as UserStatus,
        approvedCategoryId: dto.approvedCategoryId ?? user.preferredCategoryId,
      },
      include: {
        preferredCategory: true,
        approvedCategory: true,
      },
    });
  }

  async updateRole(id: number, body: { role: Role; approvedCategoryId?: number }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        role: body.role,
        approvedCategoryId: body.approvedCategoryId ?? user.approvedCategoryId,
      },
      include: {
        preferredCategory: true,
        approvedCategory: true,
      },
    });
  }
}

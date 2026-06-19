import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ILoginResponse, IUser, Role, UserStatus } from '@ishub/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<ILoginResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        department: dto.department,
        academicYear: dto.academicYear,
        preferredCategoryId: dto.preferredCategoryId,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role, user.status);
    return { accessToken: token, user: this.mapUser(user) };
  }

  async login(dto: LoginDto): Promise<ILoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role, user.status);
    return { accessToken: token, user: this.mapUser(user) };
  }

  private generateToken(
    userId: number,
    email: string,
    role: string,
    status: string,
  ): string {
    return this.jwtService.sign({ sub: userId, email, role, status });
  }

  private mapUser(prismaUser: any): IUser {
    return {
      id: prismaUser.id,
      fullName: prismaUser.fullName,
      email: prismaUser.email,
      role: prismaUser.role as Role,
      status: prismaUser.status as UserStatus,
      department: prismaUser.department,
      academicYear: prismaUser.academicYear,
      preferredCategoryId: prismaUser.preferredCategoryId,
      approvedCategoryId: prismaUser.approvedCategoryId,
      createdAt: prismaUser.createdAt.toISOString(),
      updatedAt: prismaUser.updatedAt.toISOString(),
    };
  }
}

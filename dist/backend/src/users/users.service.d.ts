import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        approvedCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: import(".prisma/client").$Enums.CategoryName;
            description: string | null;
        } | null;
        preferredCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: import(".prisma/client").$Enums.CategoryName;
            description: string | null;
        };
    } & {
        firstName: string;
        lastName: string;
        email: string;
        department: string;
        academicYear: string;
        preferredCategoryId: number;
        id: number;
        googleId: string | null;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        approvedCategoryId: number | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateStatus(id: number, dto: UpdateUserStatusDto): Promise<{
        approvedCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: import(".prisma/client").$Enums.CategoryName;
            description: string | null;
        } | null;
        preferredCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: import(".prisma/client").$Enums.CategoryName;
            description: string | null;
        };
    } & {
        firstName: string;
        lastName: string;
        email: string;
        department: string;
        academicYear: string;
        preferredCategoryId: number;
        id: number;
        googleId: string | null;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        approvedCategoryId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: import(".prisma/client").$Enums.CategoryName;
        description: string | null;
    }[]>;
}

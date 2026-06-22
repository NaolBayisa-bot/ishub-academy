import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: import(".prisma/client").$Enums.CategoryName;
        description: string | null;
    }[]>;
}

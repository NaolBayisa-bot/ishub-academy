import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  private users: any[] = [];
  private nextUserId = 1;

  user = {
    findMany: async (args?: any) => {
      let results = [...this.users];
      if (args?.where?.email) results = results.filter((u: any) => u.email === args.where.email);
      if (args?.where?.id) results = results.filter((u: any) => u.id === args.where.id);
      if (args?.where?.role) results = results.filter((u: any) => u.role === args.where.role);
      if (args?.where?.approvedCategoryId !== undefined) results = results.filter((u: any) => u.approvedCategoryId === args.where.approvedCategoryId);
      if (args?.where?.status) results = results.filter((u: any) => u.status === args.where.status);
      if (args?.where?.userId && args.where.lessonId) results = results.filter((u: any) => u.userId === args.where.userId && u.lessonId === args.where.lessonId);
      if (args?.where?.trainingId && args.where.userId) results = results.filter((u: any) => u.trainingId === args.where.trainingId && u.userId === args.where.userId);
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy).flat();
        results.sort((a: any, b: any) => (dir === 'desc' ? b[field] - a[field] : a[field] - b[field]));
      }
      if (args?.take) results = results.slice(0, args.take);
      return results.map((item: any) => ({ ...item, ...this.resolveInclude(item, args?.include) }));
    },
    findUnique: async (args?: any) => {
      const results = await this.user.findMany({ ...args, take: 1 });
      return results[0] || null;
    },
    create: async ({ data }: any) => {
      const user = {
        id: this.nextUserId++,
        role: data.role || 'STUDENT',
        status: data.status || 'PENDING',
        department: data.department || '',
        academicYear: data.academicYear || '',
        preferredCategoryId: data.preferredCategoryId || 0,
        approvedCategoryId: data.approvedCategoryId ?? null,
        passwordHash: data.passwordHash || null,
        googleId: data.googleId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.users.push(user);
      return { ...user, ...this.resolveInclude(user, {}) };
    },
    update: async ({ where, data }: any) => {
      const idx = this.users.findIndex((u: any) => u.id === where.id || u.email === where.email);
      if (idx === -1) throw new Error('User not found');
      this.users[idx] = { ...this.users[idx], ...data };
      return this.users[idx];
    },
    count: async (args?: any) => (await this.user.findMany(args)).length,
    delete: async (args?: any) => {
      const idx = this.users.findIndex((u: any) => u.id === args?.where?.id);
      if (idx === -1) throw new Error('User not found');
      return this.users.splice(idx, 1)[0];
    },
    deleteMany: async (args?: any) => {
      const toDelete = await this.user.findMany(args);
      this.users = this.users.filter((u: any) => !toDelete.includes(u));
      return { count: toDelete.length };
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await this.user.findUnique({ where });
      if (existing) {
        return this.user.update({ where, data: update?.data || update, ...(update?.include ? { include: update.include } : {}) });
      }
      return this.user.create({ data: create?.data || create, ...(create?.include ? { include: create.include } : {}) });
    },
  };

  category = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
  };

  training = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    deleteMany: async () => ({ count: 0 }),
  };

  module = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    update: async () => ({}),
    delete: async () => ({}),
  };

  lesson = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    update: async () => ({}),
    delete: async () => ({}),
  };

  lessonCompletion = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    deleteMany: async () => ({ count: 0 }),
    upsert: async () => ({}),
  };

  resource = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    update: async () => ({}),
    delete: async () => ({}),
  };

  trainingAccessGrant = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: Date.now(), ...data }),
    delete: async () => ({}),
    count: async () => 0,
    deleteMany: async () => ({ count: 0 }),
  };

  async onModuleInit() {}
  async onModuleDestroy() {}

  private resolveInclude(item: any, include?: any): any {
    if (!include) return {};
    const result: any = {};
    for (const key of Object.keys(include)) {
      result[key] = { id: item[`${key}Id`] || 1 };
      if (typeof include[key] === 'object' && include[key]?.include) {
        result[key] = { id: item[`${key}Id`] || 1, ...this.resolveInclude({}, include[key].include) };
      }
    }
    return result;
  }
}

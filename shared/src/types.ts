import { Role, UserStatus, CategoryName, Difficulty, TrainingStatus } from './enums';

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
  academicYear: string;
  preferredCategoryId: number;
  approvedCategoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  id: number;
  name: CategoryName;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITraining {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: Difficulty;
  status: TrainingStatus;
  categoryId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  modules?: IModule[];
}

export interface IModule {
  id: number;
  title: string;
  description: string | null;
  order: number;
  trainingId: number;
  createdAt: string;
  updatedAt: string;
  lessons?: ILesson[];
}

export interface ILesson {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  order: number;
  moduleId: number;
  createdAt: string;
  updatedAt: string;
  completed?: boolean;
}

export interface IProgress {
  trainingId: number;
  trainingTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface IAuthPayload {
  sub: number;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface ILoginResponse {
  accessToken: string;
  user: IUser;
}

export interface IRegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  academicYear: string;
  preferredCategoryId: number;
}
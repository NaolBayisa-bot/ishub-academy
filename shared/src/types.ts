import { Role, UserStatus, CategoryName, Difficulty, TrainingStatus, UnlockType, ResourceType } from './enums';

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
  order: number;
  unlockType: UnlockType;
  categoryId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  modules?: IModule[];
}

export interface IStudentTraining extends ITraining {
  locked: boolean;
  lockReason: string | null;
}

export interface ITrainingAccessGrant {
  id: number;
  trainingId: number;
  userId: number;
  grantedAt: string;
  grantedById: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface IResource {
  id: number;
  title: string;
  type: ResourceType;
  fileUrl: string | null;
  linkUrl: string | null;
  categoryId: number;
  trainingId: number | null;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  training?: { id: number; title: string };
  createdBy?: { id: number; firstName: string; lastName: string };
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
import { Role, UserStatus, CategoryName } from './enums';

export interface IUser {
  id: number;
  fullName: string;
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
  fullName: string;
  email: string;
  password: string;
  department: string;
  academicYear: string;
  preferredCategoryId: number;
}

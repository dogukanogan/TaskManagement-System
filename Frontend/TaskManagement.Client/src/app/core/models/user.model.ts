export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string; // Optional if we use it dynamically
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface User {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  image: string | null;
  createdAt: number;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthError {
  message: string;
  field?: 'email' | 'password' | 'name' | 'general';
}

export type AuthMode = 'signin' | 'signup';

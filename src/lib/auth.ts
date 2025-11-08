import { dbOperations } from './db';
import bcrypt from 'bcryptjs';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Validate password (minimum 6 characters)
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

// Check if email already exists
export function emailExists(email: string): boolean {
  const user = dbOperations.findUserByEmail(email);
  return user !== null;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate a unique user ID
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate authentication form data
export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export function validateAuthForm(
  email: string,
  password: string,
  mode: 'signin' | 'signup',
  name?: string,
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Email validation
  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  }

  // Password validation
  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (mode === 'signup' && !validatePassword(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters long',
    });
  }

  // Name validation (for signup)
  if (mode === 'signup' && (!name || name.trim() === '')) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

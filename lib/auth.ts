import bcrypt from 'bcryptjs';

export interface UserSession {
  userId: number;
  email: string;
  name: string;
  role: 'CITIZEN' | 'SHELTER_STAFF' | 'ADMIN';
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}
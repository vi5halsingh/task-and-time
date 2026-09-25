import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import type { SafeUser } from '../types/auth.types.js';

const BCRYPT_SALT_ROUNDS = 10;

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const normalizedEmail = input.email.toLowerCase();

  // Check for duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return newUser;
}

export async function loginUser(input: LoginInput): Promise<SafeUser> {
  const normalizedEmail = input.email.toLowerCase();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User account not found', 404);
  }

  return user;
}

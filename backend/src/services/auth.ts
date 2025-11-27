import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './database';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Get JWT_SECRET - validated at startup in index.ts for production
// In development, use a development-only default (still logged as warning in index.ts)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    // Development-only fallback - warning is logged in index.ts
    return 'development-only-secret-do-not-use-in-production';
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare a password with a hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT tokens (access + refresh)
   */
  generateTokens(payload: JWTPayload): AuthTokens {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verify a JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const passwordHash = await this.hashPassword(input.password);

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role || UserRole.ESTIMATOR,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login a user
   */
  async login(input: LoginInput) {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(
      input.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user (without password hash) and tokens
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.verifyToken(refreshToken);

      // Get user to ensure they still exist and are active
      const user = await db.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password hash
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await this.comparePassword(
      currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default AuthService;

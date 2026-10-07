import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn as any,
    }
  );
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, config.jwtSecret) as AuthUser;
}

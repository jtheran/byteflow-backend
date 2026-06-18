// src/services/auth.service.ts
import prisma from '../config/db.config';
import * as bcrypt from 'bcryptjs';
import { 
  generateAccessToken, 
  generateRefreshToken
} from '../services/token.service';

export const loginService = async (email: string, passwordPlain: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // 2. Verificar password
  const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  // 3. Aplanar permisos a un array de strings (slugs)
  const permissionsSlugs = user.role.permissions.map((rp) => rp.permission.slug);

  // 4. Payload y Firma del JWT
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role.name,
    permissions: permissionsSlugs,
  };

  const token = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(user.id, payload);

  return { accessToken: token, refreshToken: refreshToken}
};
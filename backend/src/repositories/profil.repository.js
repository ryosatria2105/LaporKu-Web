// REPOSITORY PATTERN — refactoring.guru
import { prisma } from '../lib/prisma.js';

const profilRepository = {
  findById: (userId) =>
    prisma.user.findUnique({
      where:  { id: Number(userId) },
      select: { id: true, nama: true, username: true,
                email: true, phone: true, fotoProfil: true,
                role: true, createdAt: true },
    }),

  update: (userId, data) =>
    prisma.user.update({
      where:  { id: Number(userId) },
      data,
      select: { id: true, nama: true, username: true,
                email: true, phone: true, fotoProfil: true, role: true },
    }),

  updateFoto: (userId, fotoUrl) =>
    prisma.user.update({
      where:  { id: Number(userId) },
      data:   { fotoProfil: fotoUrl },
      select: { id: true, nama: true, fotoProfil: true },
    }),

  updatePassword: (userId, passwordHash) =>
    prisma.user.update({
      where:  { id: Number(userId) },
      data:   { passwordHash },
      select: { id: true },
    }),

  getPasswordHash: async (userId) => {
    const user = await prisma.user.findUnique({
      where:  { id: Number(userId) },
      select: { passwordHash: true },
    });
    return user?.passwordHash || null;
  },
};

export default profilRepository;
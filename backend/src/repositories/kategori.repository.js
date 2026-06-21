// REPOSITORY PATTERN — refactoring.guru
import { prisma } from '../lib/prisma.js';

const kategoriRepository = {
  findAll: () =>
    prisma.kategori.findMany({ orderBy: { nama: 'asc' } }),

  findById: (id) =>
    prisma.kategori.findUnique({ where: { id: Number(id) } }),

  findByNama: (nama) =>
    prisma.kategori.findFirst({
      where: { nama: { equals: nama, mode: 'insensitive' } },
    }),

  create: (data) =>
    prisma.kategori.create({ data }),

  update: (id, data) =>
    prisma.kategori.update({ where: { id: Number(id) }, data }),

  delete: (id) =>
    prisma.kategori.delete({ where: { id: Number(id) } }),
};

export default kategoriRepository;
import { PrismaClient } from '@prisma/client';

// Singleton do PrismaClient — só é instanciado se DATABASE_URL existir.
// Sem DATABASE_URL, ordering.module.ts troca pros repositórios em memória.
// Ver docs/qa/00-briefing-do-lead.md, seção D.
let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

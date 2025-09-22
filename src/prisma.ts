import { PrismaClient } from "../prisma/generated/prisma/client.js";

declare global {
  // Trick pour éviter recréation en dev (HMR)
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

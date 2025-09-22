import { PrismaClient } from "../prisma/generated/prisma/client.js";
export const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

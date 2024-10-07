// prisma/clear.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Clear the database by truncating all tables
    await prisma.chatMessage.deleteMany({});
    await prisma.chatParticipant.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.verification.deleteMany({});

    console.log("Database cleared!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

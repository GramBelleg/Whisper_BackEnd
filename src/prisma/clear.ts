// prisma/clear.ts
import db from "./PrismaClient";

async function main() {
    // Clear the database by truncating all tables
    await db.chatMessage.deleteMany({});
    await db.chatParticipant.deleteMany({});
    await db.chat.deleteMany({});
    await db.user.deleteMany({});
    await db.verification.deleteMany({});

    console.log("Database cleared!");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

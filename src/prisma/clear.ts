// prisma/clear.ts
import db from "@DB";

async function main() {
    // Clear the database by truncating all tables
    await db.message.deleteMany({});
    await db.chatParticipant.deleteMany({});
    await db.chat.deleteMany({});
    await db.user.deleteMany({});

    console.log("Database cleared!");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

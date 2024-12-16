// prisma/clear.ts
import db from "./PrismaClient";

async function main() {
    // Clear the database by truncating all tables

    await db.comment.deleteMany({});

    await db.messageStatus.deleteMany({});

    await db.message.deleteMany({});
    await db.groupParticipant.deleteMany({});
    await db.chatParticipant.deleteMany({});
    await db.group.deleteMany({});
    await db.chat.deleteMany({});
    await db.story.deleteMany({});
    await db.storyView.deleteMany({});
    await db.user.deleteMany({});

    console.log("Database cleared!");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

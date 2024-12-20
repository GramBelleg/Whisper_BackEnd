import db from "@DB";
import { MemberSummary } from "@models/chat.models";
import { getHasStory, getPrivateProfilePic, getPrivateStatus } from "@services/user/user.service";

export const getMembers = async (userId: number, chatId: number, query: string) => {
    await db.$queryRaw`SET pg_trgm.similarity_threshold = 0.05;`;

    const chatParticipants: { id: number; userName: string }[] = await db.$queryRaw`
    SELECT "User"."id", "User"."userName"
    FROM "ChatParticipant"
    JOIN "User" ON "ChatParticipant"."userId" = "User"."id"
    WHERE "ChatParticipant"."chatId" = ${chatId} 
    AND "User"."userName" % ${query};
`;
    const members = await Promise.all(
        chatParticipants.map(async (participant) => {
            const profilePic = await getPrivateProfilePic(userId, participant.id);
            const privateStatus = await getPrivateStatus(userId, participant.id);
            const hasStory = await getHasStory(userId, participant.id);

            return {
                id: participant.id,
                userName: participant.userName,
                profilePic: profilePic,
                hasStory: hasStory,
                lastSeen: privateStatus.lastSeen,
                status: privateStatus.status,
            };
        })
    );
    return members;
};
export const getChats = async (userId: number, query: string) => {
    await db.$queryRaw`SET pg_trgm.similarity_threshold = 0.05;`;

    const groups = await db.$queryRaw`
    SELECT "Group"."name", "Group"."picture","Group"."chatId" AS "id","Chat.type"
    FROM "Group"
    JOIN 
    "Chat" ON "Group"."chatId" = "Chat"."id"
    JOIN 
    "ChatParticipant" ON "Chat"."id" = "ChatParticipant"."chatId"
    WHERE    ("Group"."isPrivate" = 'false' 
    OR "ChatParticipant"."userId" = ${userId})

    AND "Group"."name" % ${query};
`;
    const channels = await db.$queryRaw`
    SELECT "Channel"."name", "Channel"."picture","Channel"."chatId" AS "id","Chat.type"
    FROM "Channel"
    JOIN 
    "Chat" ON "Channel"."chatId" = "Chat"."id"
    JOIN 
    "ChatParticipant" ON "Chat"."id" = "ChatParticipant"."chatId"
    WHERE    ("Channel"."isPrivate" = 'false' 
    OR "ChatParticipant"."userId" = ${userId})

    AND "Channel"."name" % ${query};
`;
    const dms = await db.$queryRaw`
    SELECT 
        "Chat"."id" AS "id", 
        "User"."username" AS "name"
    FROM 
        "Chat"
    JOIN 
        "ChatParticipant" ON "Chat"."id" = "ChatParticipant"."chatId"
    JOIN 
        "User" ON "ChatParticipant"."userId" = "User"."id"
    WHERE 
        "Chat"."type" = 'DM'  -- Assuming 'type' column defines the chat type (DM or group)
        AND "ChatParticipant"."userId" != ${userId}  -- Exclude the current user
        AND "User"."username" % ${query}  -- Filter by other participant's username (case-insensitive)
`;
    return { groups, channels, dms };
};

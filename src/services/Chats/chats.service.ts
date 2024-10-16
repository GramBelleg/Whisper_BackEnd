import { Chat, ChatParticipant } from "@prisma/client";
import db from "@DB";
import bcrypt from "bcrypt";

const getChatsService = async (userId: number): Promise<void> => {
    const chatParticipants: ChatParticipant[] | null = await db.chatParticipant.findMany({
        where: {
            userId,
        },
    });
    const participantIds = chatParticipants.map((participant) => participant.id);
    const chats: Chat[] = await db.chat.findMany({
        where: {
            id: {
                in: participantIds,
            },
        },
        orderBy: {
            id: "desc",
        },
    });
    console.log(chats);
};

export { getChatsService };

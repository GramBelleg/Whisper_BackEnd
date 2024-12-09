import db from "@DB";
import { ChatUserSummary } from "@models/chat.models";
export const isAdmin = async (admin: ChatUserSummary) => {
    try {
        const user = await db.chatParticipant.findUnique({
            where: {
                chatId_userId: { chatId: admin.chatId, userId: admin.userId },
            },
            select: {
                channelParticipant: {
                    select: {
                        isAdmin: true,
                    },
                },
            },
        });
        if (!user || !user.channelParticipant) throw new Error("Group Participant not found");
        return user.channelParticipant.isAdmin;
    } catch (err: any) {
        throw err;
    }
};
export const addAdmin = async (admin: ChatUserSummary) => {
    try {
        await db.chatParticipant.update({
            where: {
                chatId_userId: { chatId: admin.chatId, userId: admin.userId },
            },
            data: {
                channelParticipant: {
                    update: {
                        data: {
                            isAdmin: true,
                        },
                    },
                },
            },
        });
    } catch (err: any) {
        if (err.code === "P2025") {
            throw new Error("ChatParticipant or channelParticipant not found.");
        }
        throw err;
    }
};

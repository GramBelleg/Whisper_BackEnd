import { ChatUserSummary } from "@models/chat.models";
import * as channelService from "@services/chat/channel.service";
import { getChatParticipantsIds } from "@services/chat/chat.service";

export const addAdmin = async (userId: number, admin: ChatUserSummary) => {
    const isAdmin = await channelService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw new Error("You're not an admin");

    await channelService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};

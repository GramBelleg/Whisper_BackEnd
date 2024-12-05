import { chatUser } from "@models/chat.models";
import { getChatParticipantsIds } from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";

export const addAdmin = async (userId: number, admin: chatUser) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw Error("User isn't an admin");

    await groupService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};

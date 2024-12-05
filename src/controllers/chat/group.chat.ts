import { chatUser, chatUserSummary } from "@models/chat.models";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";

export const addAdmin = async (userId: number, admin: chatUserSummary) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw Error("You're not an admin");

    await groupService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};
export const addUser = async (userId: number, chatUser: chatUser) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: chatUser.chatId });
    if (!isAdmin) throw Error("You're not an admin");

    await groupService.addUser(chatUser.user.id, chatUser.chatId);
    const participants = await getChatParticipantsIds(chatUser.chatId);
    const userChat = await getChat(chatUser.user.id, chatUser.chatId);
    return { participants, userChat };
};

import { ChatUser, ChatUserSummary } from "@models/chat.models";
import { UserType } from "@models/user.models";
import { getChat, getChatParticipantsIds } from "@services/chat/chat.service";
import * as groupService from "@services/chat/group.service";

export const addAdmin = async (userId: number, admin: ChatUserSummary) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: admin.chatId });
    if (!isAdmin) throw Error("You're not an admin");

    await groupService.addAdmin(admin);

    return getChatParticipantsIds(admin.chatId);
};
export const addUser = async (userId: number, ChatUser: ChatUser) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId: ChatUser.chatId });
    if (!isAdmin) throw Error("You're not an admin");

    await groupService.addUser(ChatUser.user.id, ChatUser.chatId);
    const participants = await getChatParticipantsIds(ChatUser.chatId);
    const userChat = await getChat(ChatUser.user.id, ChatUser.chatId);
    return { participants, userChat };
};
export const removeUser = async (userId: number, user: UserType, chatId: number) => {
    const isAdmin = await groupService.isAdmin({ userId, chatId });
    if (!isAdmin) throw Error("You're not an admin");

    const participants = await getChatParticipantsIds(chatId);

    await groupService.removeUser(user.id, chatId);

    return participants;
};

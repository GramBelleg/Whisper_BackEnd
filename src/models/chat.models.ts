import { Message } from "@prisma/client";

export type ChatSummary = {
    chatName: string;
    lastMessage: any;
    unreadMessageCount: number;
};

export type SaveableMessage = Pick<
    Message,
    | "chatId"
    | "senderId"
    | "content"
    | "forwarded"
    | "selfDestruct"
    | "expiresAfter"
    | "type"
    | "parentMessageId"
>;

export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "id" | "senderId" | "chatId">;

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};

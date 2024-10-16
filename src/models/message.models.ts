import { ChatMessage } from "@prisma/client";

export type SaveableMessage = Pick<
    ChatMessage,
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

export type MessageReference = Pick<ChatMessage, "id" | "senderId" | "chatId">;

export type EditableMessage = MessageReference & Pick<ChatMessage, "content">;

export {};

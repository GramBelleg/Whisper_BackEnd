import { Message } from "@prisma/client";
import { ChatType } from "@prisma/client";

export type ChatSummary = {
    user: any;
    type: ChatType;
    lastMessage: any;
    unreadMessageCount: number;
};

export type ReceivedMessage = {
    parentMessage: null | {
        content: string;
        media: string[];
    };
} & Message;

export type SentMessage = Pick<
    Message,
    | "chatId"
    | "senderId"
    | "content"
    | "media"
    | "forwarded"
    | "selfDestruct"
    | "expiresAfter"
    | "type"
    | "sentAt"
    | "parentMessageId"
    | "media"
>;

export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "id" | "senderId" | "chatId">;

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};

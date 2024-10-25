import { Message } from "@prisma/client";
import { ChatType } from "@prisma/client";

export type LastMessage = {
    id: number;
    content: string;
    type: string;
    sentAt: Date;
    time: Date;
};

export type ChatSummary = {
    other: any;
    type: ChatType;
    lastMessage: any;
    unreadMessageCount: number;
};

export type ReceivedMessage = {
    parentMessage: null | {
        content: string;
        media: string[];
    };
} & Message & { time: Date };

export type SentMessage = Pick<
    Message,
    | "chatId"
    | "senderId"
    | "content"
    | "media"
    | "sentAt"
    | "forwarded"
    | "selfDestruct"
    | "expiresAfter"
    | "type"
    | "parentMessageId"
>;

export type OmitSentAt<T> = Omit<T, "sentAt">;
export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "id" | "senderId" | "chatId">;

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};

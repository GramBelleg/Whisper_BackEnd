import { Message } from "@prisma/client";

type ParentMessage =
    | null
    | (Pick<Message, "id" | "content" | "type"> &
          Partial<Pick<Message, "media">> & {
              senderName: string;
          });

export type ReceivedMessage = Omit<Message, "parentMessageId"> & {
    parentMessage: ParentMessage;
    time: Date;
};

export type SentMessage = Pick<Message, "chatId" | "senderId" | "content" | "sentAt" | "type"> &
    Partial<
        Pick<
            Message,
            | "forwarded"
            | "selfDestruct"
            | "expiresAfter"
            | "media"
            | "isSecret"
            | "isAnnouncement"
            | "mentions"
            | "parentMessageId"
        >
    > & {
        parentMessage: ParentMessage;
    };

export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "id" | "senderId" | "chatId">;

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};

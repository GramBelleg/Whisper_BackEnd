import { Message, User } from "@prisma/client";

type ParentMessage =
    | null
    | (Pick<Message, "id" | "content" | "type"> &
          Partial<Pick<Message, "media">> & {
              senderName: string;
          });

type ForwardedFrom = null | Pick<User, "id" | "userName">;

export type ToBeFormattedMessage = Omit<Message, "time"> & { parentMessage: ParentMessage };

export type ReceivedMessage = Omit<Message, "forwardedFromUserId" | "parentMessageId"> & {
    parentMessage: ParentMessage;
    forwardedFrom: ForwardedFrom;
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
            | "forwardedFromUserId"
        >
    > & {
        parentMessage: ParentMessage;
    };

export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "id" | "senderId" | "chatId">;

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};

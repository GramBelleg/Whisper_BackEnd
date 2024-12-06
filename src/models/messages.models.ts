import { ChatParticipant, Message, MessageType, User } from "@prisma/client";
import { SenderInfo } from "./user.models";

export type ParentMessage =
    | null
    | (Pick<Message, "id"> & {
          content: string | null;
          media: string | null;
          type: MessageType | null;
          senderId: number;
          senderName: string;
          senderProfilePic: string;
      });

type ForwardedFrom = null | Pick<User, "id" | "userName" | "profilePic">;

export type DraftMessage = Pick<ChatParticipant, "draftContent" | "draftTime"> &
    Partial<Pick<ChatParticipant, "draftParentMessageId">>;

export type ReceivedDraftMessage =
    | null
    | (Pick<ChatParticipant, "draftContent" | "draftTime"> & {
          parentMessage: ParentMessage;
      });

export type ToBeFormattedMessage = Omit<Message, "time" | "mentions"> & {
    parentMessage: ParentMessage;
    sender: SenderInfo;
    forwardedFrom: ForwardedFrom;
    mentions: null | string[];
};

export type ReceivedMessage = Omit<
    Message,
    | "forwardedFromUserId"
    | "parentMessageId"
    | "mentions"
    | "senderId"
    | "read"
    | "delivered"
    | "parentContent"
    | "parentMedia"
    | "parentExtension"
    | "parentType"
> & {
    parentMessage: ParentMessage;
    forwardedFrom: ForwardedFrom;
    sender: SenderInfo;
    mentions: null | string[];
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
            | "extension"
            | "size"
            | "attachmentType"
            | "attachmentName"
            | "isSecret"
            | "isAnnouncement"
            | "mentions"
            | "parentMessageId"
            | "forwardedFromUserId"
            | "key"
        >
    >;

export type SenderIdRecord = Record<number, { chatId: number; messageIds: number[] }[]>;
export type OmitSender<T> = Omit<T, "senderId">;

export type MessageReference = Pick<Message, "senderId" | "chatId"> & { id: number };

export type EditableMessage = MessageReference & Pick<Message, "content">;

export {};

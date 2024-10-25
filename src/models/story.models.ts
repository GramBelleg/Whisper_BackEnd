import { Story } from "@prisma/client";

type SaveableStory = Pick<
    Story,
    | "userId"
    | "content"
    | "media"
>;

type OmitSender<T> = Omit<T, "userId">;

export type { SaveableStory, OmitSender };



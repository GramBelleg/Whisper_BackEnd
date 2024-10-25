import { Story } from "@prisma/client";

type SaveableStory = Pick<
    Story,
    | "id"
    | "userId"
    | "content"
    | "media"
>;

type omitId = Omit<SaveableStory, "id">;

export type { SaveableStory, omitId };



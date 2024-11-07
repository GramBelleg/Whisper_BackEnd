import { Story } from "@prisma/client";

type SaveableStory = Pick<Story, "id" | "userId" | "content" | "media" | "type">;

type omitId = Omit<SaveableStory, "id">;
type body = Omit<omitId, "userId">;

export type { SaveableStory, omitId, body };

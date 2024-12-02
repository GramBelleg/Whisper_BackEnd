import db from "@DB";
import { Prisma, Privacy, Story, storyView } from "@prisma/client";
import * as storyType from "@models/story.models";
import { getUserContacts, savedBy } from "@services/user/user.service";
import HttpError from "@src/errors/HttpError";
//TODO: except bloced people !!!!!!!!!!!!

const saveStory = async (story: storyType.omitId): Promise<Story> => {
    try {
        const user = await db.user.findUnique({
            where: { id: story.userId },
            select: { storyPrivacy: true },
        });
        const createdStory: Story = await db.story.create({
            data: {
                ...story,
                privacy: user?.storyPrivacy,
            },
        });
        return createdStory;
    } catch (e: any) {
        throw new Error("Failed to create story");
    }
};

const archiveStory = async (userId: number, storyId: number): Promise<void> => {
    try {
        const archivedStory: Story = await db.story.update({
            where: {
                id: storyId,
                userId: userId,
            },
            data: {
                isArchived: true,
            },
        });
        if (!archivedStory) throw new Error("Failed to archive story");
    } catch (error: any) {
        throw new Error(`Error in archiveStory: ${error.message}`);
    }
};

const deleteStory = async (userId: number, storyId: number): Promise<Story> => {
    try {
        const deletedStory: Story = await db.story.delete({
            where: {
                id: storyId,
                userId: userId,
            },
        });
        if (!deletedStory) throw new Error("Failed to delete story");
        return deletedStory;
    } catch (error: any) {
        throw new Error(`Error in deleteStory: ${error.message}`);
    }
};

const likeStory = async (userId: number, storyId: number, liked: boolean): Promise<storyView> => {
    try {
        // Attempt to update the record
        const previousState: storyView | null = await db.storyView.findUnique({
            where: {
                storyId_userId: {
                    storyId,
                    userId,
                },
            },
        });
        const likedStory: storyView = await db.storyView.update({
            where: {
                storyId_userId: {
                    storyId,
                    userId,
                },
            },
            data: {
                liked,
            },
        });
        if (!likedStory.liked && previousState?.liked)
            await db.story.update({
                where: {
                    id: storyId,
                },
                data: {
                    likes: {
                        decrement: 1,
                    },
                },
            });
        else if (likedStory.liked && !previousState?.liked) {
            await db.story.update({
                where: {
                    id: storyId,
                },
                data: {
                    likes: {
                        increment: 1,
                    },
                },
            });
        }
        if (!likedStory) throw new Error("Story not found");
        return likedStory;
    } catch (error: any) {
        // Check if the error indicates that the record does not exist
        throw new Error(`Error in likeStory: ${error.message}`);
    }
};

const getStoryUserId = async (storyId: number): Promise<number> => {
    try {
        const story = await db.story.findUnique({
            where: {
                id: storyId,
            },
            select: {
                userId: true,
            },
        });
        if (!story) throw new Error("Story not found");
        return story.userId;
    } catch (error: any) {
        throw new Error(`Error in getStoryUserId: ${error.message}`);
    }
};
const getStoryPrivacy = async (storyId: number): Promise<Privacy> => {
    try {
        const story = await db.story.findUnique({
            where: {
                id: storyId,
            },
            select: {
                privacy: true,
            },
        });
        if (!story) throw new Error("Story not found");
        return story.privacy;
    } catch (error: any) {
        throw new Error(`Error in getStoryPrivacy: ${error.message}`);
    }
};
const viewStory = async (userId: number, storyId: number): Promise<storyView> => {
    try {
        const data: storyView = await db.storyView.upsert({
            where: {
                storyId_userId: {
                    storyId,
                    userId,
                },
            },
            create: {
                storyId,
                userId,
            },
            update: { viewedAgain: true },
        });
        if (!data.viewedAgain)
            await db.story.update({
                where: {
                    id: storyId,
                },
                data: {
                    views: {
                        increment: 1,
                    },
                },
            });
        return data;
    } catch (error: any) {
        throw new Error(`Error in viewStory: ${error.message}`);
    }
};

//TODO: api doc
const getStoryArchive = async (userId: number): Promise<Story[]> => {
    try {
        const stories: Story[] = await db.story.findMany({
            where: {
                userId,
                isArchived: true,
            },
        });
        return stories;
    } catch (error: any) {
        throw new Error(`Error in getStoryArchive: ${error.message}`);
    }
};

const getStoryUsers = async (userId: number): Promise<any> => {
    {
        try {
            const contacts = await getUserContacts(userId); //IDs of contacts I saved
            const savedByIds = await savedBy(userId); //IDs of users who saved me as contact
            const mutualContacts = contacts.filter((id) => savedByIds.includes(id)); //IDs of mutual contacts

            const stories: Story[] = await db.story.findMany({
                where: {
                    isArchived: false,
                    OR: [
                        {
                            userId: {
                                in: contacts,
                            },
                            privacy: "Everyone",
                        },
                        {
                            userId: {
                                in: mutualContacts,
                            },
                            privacy: "Contacts",
                        },
                    ],
                },
                distinct: ["id"], // Ensure stories are unique by their `id`
            });

            const IDs = stories.map((story) => story.userId);
            const users = await db.user.findMany({
                where: {
                    id: {
                        in: IDs,
                    },
                },
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                },
                distinct: ["id"], // Ensure users are unique by their `id`
            });
            return {
                //stories,
                users,
            };
        } catch (error: any) {
            throw new Error(`Error in getStories: ${error.message}`);
        }
    }
};

const getStoriesByUserId = async (userId: number, storyUserId: number): Promise<any[]> => {
    try {
        const contacts = await getUserContacts(userId);
        const savedByIds = await savedBy(userId);
        const mutualContacts = contacts.filter((id) => savedByIds.includes(id));

        const stories = await db.$queryRawUnsafe(`
            SELECT 
                s.*,
                CASE WHEN sv_view."userId" IS NOT NULL THEN true ELSE false END AS viewed,
                COALESCE(sv_view.liked, false) AS liked,
                COUNT(sv_total."userId") AS views,
                SUM(CASE WHEN sv_total.liked = true THEN 1 ELSE 0 END) AS likes
            FROM "story" s
            LEFT JOIN "storyView" sv_view
                ON s.id = sv_view."storyId" AND sv_view."userId" = ${userId}
            LEFT JOIN "storyView" sv_total
                ON s.id = sv_total."storyId"
            WHERE 
                s."userId" = ${storyUserId} 
                AND s."isArchived" = false
                AND (
                    s.privacy = 'Everyone' OR
                    (s.privacy = 'Contacts' AND s."userId" IN (${mutualContacts.join(", ")})) OR
                    s."userId" = ${storyUserId}
                )
            GROUP BY s.id, sv_view."userId", sv_view.liked;
        `);

        return stories as any[];
    } catch (error: any) {
        throw new Error(`Error in getStoriesByUserId: ${error.message}`);
    }
};

const getStoryViews = async (storyId: number) => {
    try {
        const storyViews = await db.storyView.findMany({
            where: {
                storyId,
            },
            select: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        profilePic: true,
                    },
                },
                liked: true,
            },
        });
        return storyViews.map((view) => ({
            id: view.user.id,
            userName: view.user.userName,
            profilePic: view.user.profilePic,
            liked: view.liked,
        }));
    } catch (error: any) {
        throw new Error(`Error in getStoryUserId: ${error.message}`);
    }
};
const changeStoryPrivacy = async (storyId: number, privacy: Privacy) => {
    try {
        const result = await db.story.update({
            where: { id: storyId },
            data: { privacy },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("Story not found", 404);
        }
        throw error;
    }
};
export {
    saveStory,
    archiveStory,
    deleteStory,
    likeStory,
    getStoryUserId,
    viewStory,
    getStoryArchive,
    getStoryUsers,
    getStoriesByUserId,
    getStoryViews,
    changeStoryPrivacy,
    getStoryPrivacy,
};

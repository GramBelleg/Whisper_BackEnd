import db from "src/prisma/PrismaClient";
import { User, Story ,Verification } from "@prisma/client";

const updateUser = async ( id: number ,email: string, bio: string, name: string, userName: string,  profilePic: string) => {
    if(!id)
    {
        throw new Error("User id is required");
    }
    if(email)
    {
        const user: User | null = await db.user.update({
            where: { id },
            data: { email },
        });
    }
    if(bio)
    {
        const user: User | null = await db.user.update({
            where: { id },
            data: { bio },
        });
    }
    if(name)
    {
        const user: User | null = await db.user.update({
            where: { id },
            data: { name },
        });
    }
    if(profilePic)
    {
        const user: User | null = await db.user.update({
            where: { id },
            data: { profilePic },
        });
    }
    if(userName)
    {
        const user: User | null = await db.user.update({
            where: { id },
            data: { userName },
        });
    }
};

const setStory = async (id: number, content: string, media: string) => {
    if (!id) {
        throw new Error("User id is required");
    }

    if (content || media) {
        const createdStory = await db.story.create({
            data: {
                userId: id, // Associate the story with the user's ID
                content: content, // Assuming 'story' contains a 'content' field
                media: media, // Assuming 'story' contains a 'media' field
            },
        });
        return createdStory;
    } else {
        throw new Error("Story data is required");
    }
};

const deleteStory = async (userId: number ,storyId: number) => {
    if (!userId || !storyId) {
        throw new Error("User ID and Story ID are required");
    }

    const deletedStory = await db.story.delete({
        where: {
            id: storyId,
            userId: userId,
        },
    });
    return deletedStory;
};

const userInfo = async (email: string) => {
    const User = await db.user.findUnique({
        where: { email },
        select: {
            name: true,
            userName: true,
            email: true,
            bio: true,
            profilePic: true,
            lastSeen: true,
        }
    });
    return User;
};


export { updateUser, setStory, deleteStory, userInfo };
import db from "src/prisma/PrismaClient";
import { User, Story } from "@prisma/client";
import { verify } from "crypto";
import { verifyCode } from "@services/auth/confirmation.service";
import {checkEmailNotExist} from "@services/auth/signup.service";


//TODO: const updateUserName

const updateBio = async (id: number, bio: string) => {
    try {
            await db.user.update({
                where: { id },
                data: { bio },
        });
    } catch (error) {
        console.error("Error updating bio:", error);
        throw new Error("Unable to update bio");
    }
};


const updateName = async (id: number, name: string) => {
    if (!name) {
        throw new Error("Name is required");
    }

    try {
            await db.user.update({
                where: { id },
                data: { name },
        });
        return name; // Return the updated name
    } catch (error) {
        console.error("Error updating name:", error);
        throw new Error("Unable to update name");
    }
};

const updateEmail = async (id: number, email: string, code: string) => {
    if (!email) {
        throw new Error("Email is required");
    }
    try {
        await verifyCode(email, code, "confirmEmail");        
        await db.user.update({
            where: { id },
            data: { email },
        });
        return email; // Return the updated user
    } catch (error) {
        console.error("Error updating email:", error);
        throw new Error("Unable to update email");
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
            /*TODO: userName: true,*/  
            email: true,
            bio: true,
            profilePic: true,
            lastSeen: true,
        }
    });
    if(!User || !User.email)
    {
        throw new Error("User not found");
    }
    return User;
};


export {setStory, deleteStory, userInfo, updateBio, updateName, updateEmail};
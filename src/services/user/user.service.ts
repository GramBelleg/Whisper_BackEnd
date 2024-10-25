import db from "src/prisma/PrismaClient";
import { verifyCode } from "@services/auth/confirmation.service";
import { validatePhone } from "@validators/user";
import RedisOperation from "@src/@types/redis.operation";
import { saveStory } from "@services/redis/story.service";
import { Story } from "@prisma/client";
import { SaveableStory } from "@models/story.models";
import { tr } from "@faker-js/faker/.";

//TODO: const updateUserName

const updateBio = async (id: number, bio: string): Promise<string> => {
    try {
        await db.user.update({
            where: { id },
            data: { bio },
        });
        return bio;
    } catch (error) {
        console.error("Error updating bio:", error);
        throw new Error("Unable to update bio");
    }
};

const updateName = async (id: number, name: string): Promise<string> => {
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

const updateEmail = async (id: number, email: string, code: string): Promise<string> => {
    if (!email) {
        throw new Error("Email is required");
    }
    try {
        await verifyCode(email, code, RedisOperation.ConfirmEmail);
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

const updatePhone = async (id: number, phoneNumber: string): Promise<string> => {
    if (!phoneNumber) {
        throw new Error("Phone is required");
    }
    try {
        const phone = validatePhone({ phoneNumber: phoneNumber });
        await db.user.update({
            where: { id },
            data: { phoneNumber: phone },
        });
        return phone; // Return the updated user
    } catch (error) {
        console.error("Error updating phone:", error);
        throw new Error("Unable to update phone");
    }
};

const setStory = async (story: SaveableStory): Promise<Story> => {
    try {
        const createdStory = await db.story.create({
            data: {...story},
        });
        await saveStory(createdStory);
        return createdStory;
    } catch (error) {
        throw new Error("Unable to set story");
    }
};

//TODO: fix delete story


//TODO: check the type of the return value
const userInfo = async (email: string): Promise<any> => {
    const User = await db.user.findUnique({
        where: { email },
        select: {
            name: true,
            /*TODO: userName: true,*/
            email: true,
            bio: true,
            profilePic: true,
            lastSeen: true,
            phoneNumber: true,
        },
    });
    if (!User || !User.email) {
        throw new Error("User not found");
    }
    return User;
};

const changePic = async (id: number, name: string): Promise<string> => {
    try {
        await db.user.update({
            where: { id },
            data: { profilePic: name },
        });
        return name; 
    } catch (error) {
        console.error("Error updating profile picture:", error);
        throw new Error("Unable to update profile picture");
    }
}

const changeUserName = async (id: number, userName: string): Promise<string> => {
    try {
        if(!id || !userName) {
            throw new Error("User ID and username are required");
        }
        await db.user.update({
            where: { id },
            data: { userName },
        });
        return userName; 
    } catch (error) {
        throw new Error("Username is already taken");
    }
};

export {setStory, userInfo, updateBio, updateName, updateEmail, updatePhone, changePic, changeUserName};
import db from "@src/prisma/PrismaClient";
import { validatePhoneNumber } from "@validators/auth";
import RedisOperation from "@src/@types/redis.operation";
import { Prisma, Privacy, Status, Story } from "@prisma/client";
import { verifyCode } from "@services/auth/code.service";
import HttpError from "@src/errors/HttpError";

export const updateBio = async (id: number, bio: string): Promise<string> => {
    try {
        await db.user.update({
            where: { id },
            data: { bio },
        });
        return bio;
    } catch (error) {
        throw new Error("Unable to update bio");
    }
};

export const updateName = async (id: number, name: string): Promise<string> => {
    if (!name) {
        throw new HttpError("Name is required", 400);
    }

    try {
        await db.user.update({
            where: { id },
            data: { name },
        });
        return name; // Return the updated name
    } catch (error) {
        throw new Error("Unable to update name");
    }
};

export const updateEmail = async (id: number, email: string, code: string): Promise<string> => {
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
        throw new Error("Unable to update email");
    }
};

//TODO: check the structure of the phone number
export const updatePhone = async (id: number, phoneNumber: string): Promise<string> => {
    const phone = validatePhoneNumber(phoneNumber);
    try {
        await db.user.update({
            where: { id },
            data: { phoneNumber: phone },
        });
        return phone; // Return the updated user
    } catch (error) {
        throw new HttpError("Unable to update phone", 500);
    }
};

//TODO: check the type of the return value
export const userInfo = async (id: number): Promise<any> => {
    const user = await db.user.findUnique({
        where: { id },
        select: {
            name: true,
            userName: true,
            email: true,
            bio: true,
            profilePic: true,
            lastSeen: true,
            status: true,
            phoneNumber: true,
            autoDownloadSize: true,
            readReceipts: true,
            storyPrivacy: true,
            pfpPrivacy: true,
            lastSeenPrivacy: true,
            storyCount: true,
        },
    });
    if (!user) {
        throw new Error("user not found");
    }
    const hasStory = user.storyCount > 0 ? true : false;
    return { ...user, hasStory };
};
export const partialUserInfo = async (viewerId: number, viewedId: number) => {
    const user = await db.user.findUnique({
        where: { id: viewedId },
        select: {
            userName: true,
            phoneNumber: true,
            bio: true,
        },
    });
    if (!user) {
        throw new Error("user not found");
    }
    return {
        ...user,
        profilePic: await getPrivateProfilePic(viewerId, viewedId),
        ...(await getPrivateStatus(viewerId, viewedId)),
        hasStory: await getHasStory(viewerId, viewedId),
    };
};
export const displayedUser = async (viewerId: number, viewedId: number) => {
    const user = await db.user.findUnique({
        where: { id: viewerId },
        select: {
            id: true,
            userName: true,
        },
    });
    if (!user) {
        throw new Error("user not found");
    }
    return {
        ...user,
        profilePic: await getPrivateProfilePic(viewerId, viewedId),
        ...(await getPrivateStatus(viewerId, viewedId)),
        hasStory: await getHasStory(viewerId, viewedId),
    };
};

export const changePic = async (id: number, profilePic: string): Promise<string | null> => {
    try {
        const user = await db.user.update({
            where: { id },
            data: { profilePic: profilePic },
        });
        if (!user) throw new HttpError("User Not Found", 404);
        if (user.profilePic == undefined) throw new HttpError("Profile picture not found", 404);
        return user.profilePic;
    } catch (error) {
        console.error("Error updating profile picture:", error);
        throw new Error("Unable to update profile picture");
    }
};

export const changeUserName = async (id: number, userName: string): Promise<string> => {
    if (!userName) {
        throw new HttpError("Username is required", 400);
    }
    try {
        const updatedUser = await db.user.update({
            where: { id },
            data: { userName },
        });
        //TODO: check if the userName is the same as the previous one
        return userName;
    } catch (error) {
        throw new HttpError("Username is already taken", 409);
    }
};

export const getUserId = async (userName: string): Promise<number | null> => {
    const result = await db.user.findFirst({
        where: { userName },
        select: { id: true },
    });
    if (!result) return null;
    return result.id;
};
export const changeAutoDownloadSize = async (userId: number, size: number) => {
    try {
        const result = await db.user.update({
            where: { id: userId },
            data: { autoDownloadSize: size },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const changeLastSeenPrivacy = async (userId: number, privacy: Privacy) => {
    try {
        const result = await db.user.update({
            where: { id: userId },
            data: { lastSeenPrivacy: privacy },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const changePfpPrivacy = async (userId: number, privacy: Privacy) => {
    try {
        const result = await db.user.update({
            where: { id: userId },
            data: { pfpPrivacy: privacy },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const changeStoryPrivacy = async (userId: number, privacy: Privacy) => {
    try {
        const result = await db.user.update({
            where: { id: userId },
            data: { storyPrivacy: privacy },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const getPfpPrivacy = async (userId: number) => {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { pfpPrivacy: true },
        });
        return user?.pfpPrivacy;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const getLastSeenPrivacy = async (userId: number) => {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { lastSeenPrivacy: true },
        });
        return user?.lastSeenPrivacy;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const getAllUserIds = async () => {
    try {
        const userIds: number[] = (
            await db.user.findMany({
                select: { id: true },
            })
        ).map((user) => user.id);
        return userIds;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const getUserContacts = async (userId: number) => {
    try {
        const userIds: number[] = (
            await db.relates.findMany({
                where: { relatingId: userId, isContact: true, isBlocked: false },
                select: { relatedById: true },
            })
        ).map((user) => user.relatedById);
        userIds.push(userId);
        return userIds;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};

export const savedBy = async (userId: number): Promise<number[]> => {
    try {
        const saved = await db.relates.findMany({
            select: { relatingId: true },
            where: { relatedById: userId, isContact: true, isBlocked: false },
        });
        return saved.map((user) => user.relatingId);
    } catch (error) {
        throw error;
    }
};

export const addContact = async (relatingId: number, relatedById: number) => {
    try {
        await db.relates.upsert({
            where: {
                relatingId_relatedById: {
                    relatingId,
                    relatedById,
                },
            },
            update: {
                isContact: true,
            },
            create: {
                relatingId,
                relatedById,
                isContact: true,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};
export const updateStatus = async (id: number, status: Status) => {
    try {
        const user = await db.user.update({
            where: { id },
            data: { status, lastSeen: new Date() },
        });
        return user.lastSeen;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new HttpError("User not found", 404);
        }
        throw error;
    }
};

export const getLastMessageSender = async (messageId: number) => {
    const result = await db.message.findUnique({
        where: { id: messageId },
        select: {
            sender: {
                select: {
                    id: true,
                    userName: true,
                },
            },
        },
    });
    if (!result) return null;
    return result;
};

export const getSenderInfo = async (id: number) => {
    return await db.user.findUnique({
        where: { id },
        select: {
            id: true,
            userName: true,
            profilePic: true,
            name: true,
        },
    });
};

export const updateAddPermission = async (id: number, addPermission: boolean) => {
    await db.user.update({
        where: {
            id,
        },
        data: {
            addPermission,
        },
    });
};
export const getAddPermission = async (id: number) => {
    const user = await db.user.findUnique({
        where: {
            id,
        },
        select: {
            addPermission: true,
        },
    });
    if (!user) throw new Error("User Not Found");
    return user.addPermission;
};

export const getContacts = async (id: number) => {
    const contacts = await db.relates.findMany({
        where: {
            relatingId: id,
            isContact: true,
            isBlocked: false,
        },
        select: {
            relatedBy: {
                select: {
                    id: true,
                    userName: true,
                    profilePic: true,
                },
            },
        },
    });
    return contacts.map((contact) => ({
        id: contact.relatedBy.id,
        userName: contact.relatedBy.userName,
        profilePic: contact.relatedBy.profilePic,
    }));
};

export const isBlocked = async (relatingId: number, relatedById: number) => {
    const result = await db.relates.findFirst({
        where: {
            OR: [
                { relatingId: relatingId, relatedById: relatedById },
                { relatingId: relatedById, relatedById: relatingId },
            ],
            AND: { isBlocked: true },
        },
        select: { isBlocked: true },
    });
    if (!result) return false;
    return result.isBlocked;
};

export const getPrivateProfilePic = async (viewerId: number, viewedId: number) => {
    const user = await db.user.findUnique({
        where: {
            id: viewedId,
        },
        select: {
            pfpPrivacy: true,
            profilePic: true,
        },
    });
    if (!user) throw new Error("User doesn't exist");
    const relation = await db.relates.findUnique({
        where: {
            relatingId_relatedById: { relatingId: viewedId, relatedById: viewerId },
        },
    });

    if (
        (user.pfpPrivacy == "Everyone" && (!relation || !relation.isBlocked)) ||
        (user.pfpPrivacy == "Contacts" && relation?.isContact)
    )
        return user.profilePic;
    return null;
};
export const getPrivateStatus = async (viewerId: number, viewedId: number) => {
    const user = await db.user.findUnique({
        where: {
            id: viewedId,
        },
        select: {
            lastSeenPrivacy: true,
            lastSeen: true,
            status: true,
        },
    });
    if (!user) throw new Error("User doesn't exist");
    const relation = await db.relates.findUnique({
        where: {
            relatingId_relatedById: { relatingId: viewedId, relatedById: viewerId },
        },
    });

    if (
        (user.lastSeenPrivacy == "Everyone" && (!relation || !relation.isBlocked)) ||
        (user.lastSeenPrivacy == "Contacts" && relation?.isContact)
    )
        return { lastSeen: user.lastSeen, status: user.status };
    return { lastSeen: null, status: null };
};

export const getHasStory = async (viewerId: number, viewedId: number) => {
    const user = await db.user.findUnique({
        where: {
            id: viewedId,
        },
    });
    const relation = await db.relates.findUnique({
        where: {
            relatingId_relatedById: { relatingId: viewedId, relatedById: viewerId },
        },
    });
    if (!user) throw Error("User Not Foun");
    if (
        (user.contactStory && relation?.isContact && !relation?.isBlocked) ||
        (user.everyOneStory && (!relation || !relation.isBlocked))
    )
        return true;
    return false;
};

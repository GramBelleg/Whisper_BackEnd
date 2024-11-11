import { Request, Response } from "express";
import { findBlockedUsers } from "@services/user/prisma/find.service";
import { checkUsersExistDB, checkUserExistUsers } from "@services/user/block.service";
import { updateRelates } from "@services/user/prisma/update.service";
import { createRelates } from "@services/user/prisma/create.service";
import { validateBlockData } from "@validators/user";

const getBlockedUsers = async (req: Request, res: Response) => {
    const blockedUsers = await findBlockedUsers(req.userId);
    res.status(200).json(
        blockedUsers.map((user) => ({
            userId: user.id,
            userName: user.userName,
            profilePic: user.profilePic,
        }))
    );
};

const handleUserBlocks = async (req: Request, res: Response) => {
    validateBlockData(req.body.users, req.body.blocked);
    checkUserExistUsers(req.userId, req.body.users);
    await checkUsersExistDB(req.body.users);
    await updateRelates(req.userId, req.body.users, req.body.blocked);
    await createRelates(req.userId, req.body.users, req.body.blocked);
    res.status(200).json({
        status: "success",
        message: "User has been blocked or unblocked successfully.",
    });
};

export { getBlockedUsers, handleUserBlocks };

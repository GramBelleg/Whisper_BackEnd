import { Request, Response } from "express";
import { banUser, filterGroup, getAllGroups, getAllUsers } from "@services/admin/admin.service";
import { deleteAllUserTokens } from "@services/auth/prisma/delete.service";
import { removeUserSocket } from "@socket/web.socket";

export const handleBanUser = async (req: Request, res: Response): Promise<void> => {
    const ban =  req.params.ban === "true";
    const bannedUserId = Number(req.params.userId);
    await banUser(bannedUserId, ban);
    if (ban) {
        await deleteAllUserTokens(bannedUserId);
        await removeUserSocket(bannedUserId);
    }
    res.status(200).send({ message: "User ban state updated successfully" });
};

export const handleFilterGroup = async (req: Request, res: Response): Promise<void> => {
    const filter = req.params.filter === "true";
    const groupId = Number(req.params.groupId);
    await filterGroup(groupId, filter);
    res.status(200).send({ message: "Group filter status updated successfully" });
};

export const handleGetAllGroups = async (_req: Request, res: Response): Promise<void> => {
    const groups = await getAllGroups();
    res.status(200).send(groups);
};

export const handleGetAllUsers = async (_req: Request, res: Response): Promise<void> => {
    const users = await getAllUsers();
    res.status(200).send(users);
};

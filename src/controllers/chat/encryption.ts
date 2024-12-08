import { Request, Response } from "express";
import {
    createUserKey,
    getUserKey,
    getOtherUserKey,
    associateParticipantKey,
} from "@services/chat/encryption.service";
import { validateChatAndUser } from "@validators/chat";

export const handleCreateKey = async (req: Request, res: Response) => {
    const userId = req.userId;
    const key = req.body.key;
    const keyId = await createUserKey(userId, key);
    res.status(200).json(keyId);
};

export const handleGetKey = async (req: Request, res: Response) => {
    const keyId_str = req.query.keyId;
    const keyId = Number(keyId_str);
    if (!keyId_str || isNaN(keyId)) {
        res.status(400).json({ message: "Invalid keyId" });
        return;
    }
    const key = await getUserKey(keyId);
    if (key === "") {
        res.status(404).json({ message: "Key not found" });
        return;
    }
    res.status(200).json(key);
};

export const handleAssociateParticipantKey = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    validateChatAndUser(userId, chatId, res);
    const keyId_str = req.query.keyId;
    const keyId = Number(keyId_str);
    if (!keyId_str || isNaN(keyId)) {
        res.status(400).json({ message: "Invalid keyId" });
        return;
    }
    await associateParticipantKey(userId, chatId, keyId);
    res.status(200).json("Key associated successfully");
};

export const handleGetOtherUserKey = async (req: Request, res: Response) => {
    const userId = req.userId;
    const chatId = Number(req.params.chatId);
    validateChatAndUser(userId, chatId, res);
    const key = await getOtherUserKey(userId, chatId);
    if (key === "") {
        res.status(404).json({ message: "Key not found" });
        return;
    }
    res.status(200).json(key);
};

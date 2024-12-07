import * as callServices from "@services/call/call.service";
import { Request, Response } from "express";
import HttpError from "@src/errors/HttpError";


export const generateToken = async (req: Request, res: Response) => {
    const chatId = req.params.chatId;
    const userId = req.userId;
    const token = callServices.callToken(userId, chatId);
    res.status(200).json({
        status: "success",
        data: token,
    });
};

export const makeCall = async (req: Request, res: Response) => {
    const chatId = req.params.chatId;
    const userId = req.userId;
    const token = await callServices.makeCall(userId, chatId);
    res.status(200).json({
        status: "success",
        token: token,
    });
}
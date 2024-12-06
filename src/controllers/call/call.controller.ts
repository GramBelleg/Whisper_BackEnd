import * as callServices from "@services/call/call.service";
import { Request, Response } from "express";
import HttpError from "@src/errors/HttpError";


export const generateToken = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    if(isNaN(chatId)) {
        throw new HttpError("Invalid chatId", 400);
    }
    const userId = req.userId;
    const token = callServices.callToken(chatId, userId);
    res.status(200).json({
        status: "success",
        data: token,
    });
};

export const makeCall = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId);
    if(isNaN(chatId)) {
        throw new HttpError("Invalid chatId", 400);
    }
    const userId = req.userId;
    const token = await callServices.makeCall(chatId, userId);
    res.status(200).json({
        status: "success",
        data: token,
    });
}
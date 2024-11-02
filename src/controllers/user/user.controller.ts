import { Request, Response } from "express";
import * as userServices from "@services/user/user.service";
import { validateEmail } from "@validators/confirm.reset";
import { sendCode } from "@services/auth/confirmation.service";
import { findEmail } from "@services/auth/signup.service";
import RedisOperation from "@src/@types/redis.operation";
import HttpError from "@src/errors/HttpError";

const updateBio = async (req: Request, res: Response) => {
    try {
        let { bio = "" }: { bio: string } = req.body;
        let id: number = req.userId;
        await userServices.updateBio(id, bio);
        res.status(200).json({
            status: "success",
            data: bio,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const updateName = async (req: Request, res: Response) => {
    try {
        let { name = "" }: { name: string } = req.body;
        let id: number = req.userId;
        await userServices.updateName(id, name);
        res.status(200).json({
            status: "success",
            data: name,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const updateEmail = async (req: Request, res: Response) => {
    let { email = "", code = "" }: { email: string; code: string } = req.body;
    let id: number = req.userId;
    try {
        await userServices.updateEmail(id, email, code);
        res.status(200).json({
            status: "success",
            data: email,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};
const emailCode = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as Record<string, string>;
    validateEmail(email);

    const foundEmail = await findEmail(email);
    if (foundEmail) throw new HttpError("Email already exists", 409);

    const code = await userServices.createCode(email, RedisOperation.ConfirmEmail);
    const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
    await sendCode(email, "confirmation code", emailBody);

    res.status(200).json({
        status: "success",
    });
};

const updatePhone = async (req: Request, res: Response) => {
    //TODO: fix Phone number structure is not valid
    try {
        let { phoneNumber = "" }: { phoneNumber: string } = req.body;
        let id: number = req.userId;
        let updatedPhone = await userServices.updatePhone(id, phoneNumber);
        res.status(200).json({
            status: "success",
            data: updatedPhone,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const changePic = async (req: Request, res: Response) => {
    //to delete profilePic blobName = "profilePic.jpg"
    const id: number = req.userId;
    const blob = req.body.blobName;
    try {
        await userServices.changePic(id, blob);
        res.status(200).json({
            status: "success",
            name: blob,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const userInfo = async (req: Request, res: Response) => {
    try {
        let user = await userServices.userInfo(req.userId);
        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const changeUserName = async (req: Request, res: Response) => {
    try {
        let { userName = "" }: { userName: string } = req.body;
        let id: number = req.userId;
        await userServices.changeUserName(id, userName);
        res.status(200).json({
            status: "success",
            data: userName,
        });
    } catch (e: any) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export {
    userInfo,
    updateBio,
    updateName,
    updateEmail,
    emailCode,
    updatePhone,
    changePic,
    changeUserName,
};

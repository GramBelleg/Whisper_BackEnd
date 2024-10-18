import { User } from "@prisma/client";
import { Request, Response } from "express";
import * as userServices from "@services/Profile/user.services";
import { validateEmail } from "@validators/confirm.reset";
import { createCode, sendCode } from "@services/auth/confirmation.service";
import { checkEmailNotExist } from "@services/auth/signup.service";

//TODO: const updateUserName

const updateBio = async (req: Request, res: Response) => {
    try 
    {
        let { bio = "" }: { bio: string } = req.body;
        let id: number = req.userId;
        await userServices.updateBio(id, bio);
        res.status(200).json({
            status: "success",
            data: bio
        });
    } 
    catch (e: any) 
    {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
}

const updateName = async (req: Request, res: Response) => {
    try 
    {
        let { name = "" }: { name: string } = req.body;
        let id: number = req.userId;
        await userServices.updateName(id, name);
        res.status(200).json({
            status: "success",
            data: name
        });
    } 
    catch (e: any) 
    {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
}

const updateEmail = async (req: Request, res: Response) => {
    let { email = "", code = "" }: { email: string, code: string } = req.body;
    let id: number = req.userId;
    try 
    {
        await userServices.updateEmail(id, email, code);
        res.status(200).json({
            status: "success",
            data: email
        });
    } 
    catch (e: any) 
    {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};
const emailCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body as Record<string, string>;
        validateEmail(email);

        //in DB
        await checkEmailNotExist(email);
        const code = await createCode(email, "confirmEmail");
        const emailBody = `<h3>Hello, </h3> <p>Thanks for joining our family. Use this code: <b>${code}</b> for verifing your email</p>`;
        await sendCode(email, emailBody);

        res.status(200).json({
            status: "success",
        });
    } catch (e: any) {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const setStory = async (req: Request, res: Response) => {
    try 
    {
        let { content = "", media = ""}: { content:string, media: string } = req.body;
        let id: number = req.userId;
        await userServices.setStory(id, content, media);
        res.status(200).json({
            status: "success",
        });
    } 
    catch (e: any) 
    {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

const deleteStory = async (req: Request, res: Response) => {
    try 
    {
        let id: number = req.userId;
        let storyId: number = req.body.storyId;
        await userServices.deleteStory(id, storyId);
        res.status(200).json({
            status: "success",
        });
    } 
    catch (e: any) 
    {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
    
};

const UserInfo = async (req: Request, res: Response) => {
    try 
    {
        let user = await userServices.userInfo(req.body.email);
        res.status(200).json({
            status: "success",
            data: user,
        });
    } 
    catch (e: any) 
    {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export { setStory, deleteStory, UserInfo, updateBio, updateName, updateEmail, emailCode };
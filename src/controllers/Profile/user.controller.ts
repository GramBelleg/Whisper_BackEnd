import { User } from "@prisma/client";
import { Request, Response } from "express";
import * as userServices from "@services/Profile/user.services";

const updateUser = async (req: Request, res: Response) => {
    try 
    {
        let { email = "", bio="", name="", userName="", profilePic="" }: { email: string; bio: string; name: string; userName: string, profilePic: string } = req.body;
        let id: number = req.userId;
        userServices.updateUser(id, email, bio, name, userName, profilePic);
        res.status(200).json({
            status: "success",
        });
    } 
    catch (e: any) 
    {
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
        userServices.setStory(id, content, media);
        res.status(200).json({
            status: "success",
        });
    } 
    catch (e: any) 
    {
        console.log(e.message);
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
        userServices.deleteStory(id, storyId);
        res.status(200).json({
            status: "success",
        });
    } 
    catch (e: any) 
    {
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
    
};

const getUserInfo = async (req: Request, res: Response) => {
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
        console.log(e.message);
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

export { updateUser, setStory, deleteStory, getUserInfo };
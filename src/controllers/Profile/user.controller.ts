import { User } from "@prisma/client";
import { Request, Response } from "express";
import * as userServices from "@services/Profile/user.services";

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

export { setStory, deleteStory, UserInfo, updateBio, updateName };
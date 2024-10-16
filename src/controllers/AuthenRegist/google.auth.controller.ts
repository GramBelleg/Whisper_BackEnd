import { Request, Response } from "express";
import { getUserData, upsertUser } from "@services/AuthenRegist/google.auth.service";
import jwt from "jsonwebtoken";
import { createCookie } from "@services/AuthenRegist/cookie.service";
import { User } from "@prisma/client";

async function googleAuth(req: Request, res: Response): Promise<void> {
    try {
        const token: string | undefined = req.body.token;
        
        const data: Record<string, any> = await getUserData(token);
    
        const user: User = await upsertUser(data);

        const userToken: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        
        createCookie(res, userToken);
        res.status(200).json({
            status: "success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            userToken,
        });
    } catch (err: any) {
        console.log(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

export default googleAuth;

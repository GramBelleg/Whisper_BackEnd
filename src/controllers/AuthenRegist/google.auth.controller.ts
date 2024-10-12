import { Request, Response } from "express";
import { getUserData, upsertUser } from "@services/AuthenRegist/google.auth.service";
import jwt from "jsonwebtoken";
import createCookie from "@services/AuthenRegist/cookie.service";
import { User } from "@prisma/client";

async function googleAuth(req: Request, res: Response): Promise<void> {
    try {
        // google token after sign-up or login using google service
        const token: string | undefined = req.body.token;
        if (!token) {
            throw new Error("There is no token");
        }
        //get user info using googleApi
        const data: Record<string, any> | undefined = await getUserData(token);
        if (!data) {
            throw new Error("Invalid token");
        }
        console.log(data);
        //upsert user into db
        const user: User = await upsertUser(data);

        //create a jwt and store it in a cookie
        const user_token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        createCookie(res, user_token);

        res.status(200).json({
            status: "success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            user_token,
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

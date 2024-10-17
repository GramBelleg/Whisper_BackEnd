import { Request, Response } from "express";
import { getAccessToken, getUserData } from "@services/Auth/google.auth.service";
import { upsertUser } from "@services/Auth/signup.service";
import jwt from "jsonwebtoken";
import { createCookie } from "@services/Auth/cookie.service";
import { User } from "@prisma/client";

async function googleAuth(req: Request, res: Response): Promise<void> {
    try {
        const authCode: string | undefined = req.body.code;
        if (!authCode) {
            throw new Error("There is no Authorization Code");
        }

        const accessToken = await getAccessToken(authCode);

        const userData: Record<string, any> | undefined = await getUserData(accessToken);
        if (!userData) {
            throw new Error("Invalid Access Token");
        }

        const user: User = await upsertUser(userData);

        //create a jwt and store it in a cookie
        const userToken: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
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

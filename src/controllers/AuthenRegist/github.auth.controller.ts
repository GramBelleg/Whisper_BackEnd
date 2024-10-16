import { Request, Response } from "express";
import {
    getAccessToken,
    getUserData,
    upsertUser,
} from "@services/AuthenRegist/github.auth.service";
import jwt from "jsonwebtoken";
import createCookie from "@services/AuthenRegist/cookie.service";
import { User } from "@prisma/client";

async function githubRedirect(req: Request, res: Response): Promise<void> {
    try {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;
        res.redirect(authUrl);
    } catch (err: any) {
        console.log(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

async function githubAuth(req: Request, res: Response): Promise<void> {
    try {
        const authCode: string = req.query.code as string;
        if (!authCode) {
            throw new Error("There is no Authorization Code");
        }

        const accessToken = await getAccessToken(authCode);

        const userData: Record<string, any> | undefined = await getUserData(accessToken);
        console.log(userData);
        if (!userData) {
            throw new Error("No User Data retrieved");
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

export { githubAuth, githubRedirect };

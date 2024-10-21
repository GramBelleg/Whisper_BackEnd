import { Request, Response } from "express";
import { getAccessToken, getUserData } from "@services/auth/github.auth.service";
import { upsertUser } from "@services/auth/signup.service";
import { createTokenCookie, createAddToken } from "@services/auth/token.service";
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
        if (!userData) {
            throw new Error("No User Data retrieved");
        }

        const user: User = await upsertUser(userData);

        const userToken = await createAddToken(user.id);
        createTokenCookie(res, userToken);

        res.redirect(process.env.PROFILE_ENDPOINT as string);
    } catch (err: any) {
        console.log(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

export { githubAuth, githubRedirect };

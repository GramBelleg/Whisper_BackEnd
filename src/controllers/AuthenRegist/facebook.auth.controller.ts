import { Request, Response } from "express";
import {
    getAccessToken,
    getUserData,
    upsertUser,
} from "@services/AuthenRegist/facebook.auth.service"; // You'll need to create this service
import jwt from "jsonwebtoken";
import createCookie from "@services/AuthenRegist/cookie.service";
import { User } from "@prisma/client";
import querystring from "querystring";
import crypto from "crypto";

async function facebookRedirect(req: Request, res: Response): Promise<void> {
    try {
        const state = crypto.randomBytes(16).toString("hex");
        req.session.state = state;

        const appInfo = querystring.stringify({
            client_id: process.env.FB_CLIENT_ID,
            redirect_uri: process.env.FB_REDIRECT_URI,
            state, //state is used to verify in the callback that this was the original request
            response_type: "code",
            scope: "email public_profile", // Facebook permissions you need (email, public_profile, etc.)
        });

        res.redirect(`https://www.facebook.com/v11.0/dialog/oauth?${appInfo}`);
    } catch (err: any) {
        console.log("caught here");
        console.log(err.message);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

async function facebookAuth(req: Request, res: Response): Promise<void> {
    try {
        const code = req.query.code as string | undefined;
        const state = req.query.state as string | undefined;

        if (!code || !state) {
            throw new Error("Authorization code or state missing");
        }
        if (req.session.state != state) {
            throw new Error("Possible Attack Facebook didn't redirect you");
        }
        const accessToken = await getAccessToken(code);

        const userData: Record<string, any> | undefined = await getUserData(accessToken);
        if (!userData) {
            throw new Error("Invalid Access Token");
        }

        const user: User = await upsertUser(userData);

        // Create a JWT and store it in a cookie
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
        console.log(err);
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
}

export { facebookAuth, facebookRedirect };

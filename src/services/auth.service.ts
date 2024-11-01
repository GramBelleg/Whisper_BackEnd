import { Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { checkUserTokenExist } from "./auth/token.service";
import { deleteUserToken } from "./prisma/delete.service";

function getToken(req: Request) {
    let token: string;
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.replace("Bearer", "").trim();
    } else {
        throw new Error("Token is not found");
    }
    return token;
}

async function verifyUserToken(userToken: string) {
    let userId: number | undefined = undefined;
    try {
        userId = (
            jwt.verify(userToken, process.env.JWT_SECRET as string, {
                ignoreExpiration: true,
            }) as Record<string, any>
        ).id;
        if (!userId) throw new Error();
        await checkUserTokenExist(userId, userToken);
        // check expiration of token
        jwt.verify(userToken, process.env.JWT_SECRET as string);
        return userId;
    } catch (err: any) {
        if (err instanceof TokenExpiredError) {
            console.log("expired");
            if (userId) deleteUserToken(userId, userToken);
        }
        throw new Error("Login again.");
    }
}

export { getToken, verifyUserToken };

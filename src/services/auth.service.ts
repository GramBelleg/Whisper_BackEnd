import { Request } from "express";
import db from "@DB";

function getToken(req: Request) {
    let token: string;
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer ", "");
    } else {
        throw new Error("Token is not found");
    }
    return token;
}

async function checkLogoutAll(userId: number) {
    const user = await db.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error("User is not existed");
    }
    if (user.loggedInDevices <= 0) {
        throw new Error("All devices are logged out. Login again");
    }
}

export { getToken, checkLogoutAll };

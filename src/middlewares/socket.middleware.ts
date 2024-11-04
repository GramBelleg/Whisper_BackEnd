import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { verifyUserToken } from "@services/auth/token.service";

export const cookieParse = async (cookie: string, socket: Socket): Promise<number | undefined> => {
    // Extract token from cookie
    try {
        const token: string | undefined = cookie
            .split(";")
            .find((c): c is string => c.trim().startsWith("token="));
        if (token) {
            return await verifyUserToken(token.split("=")[1]);
        }
    } catch (err) {
        return;
    }
};

import { Socket } from "socket.io";
import { cookieParse, verifyToken } from "@middlewares/socket.middleware";
import { verify } from "crypto";

export const validateCookie = (socket: Socket): number | undefined => {
    const cookie = socket.handshake.headers.cookie;
    const token = socket.handshake.query.token;
    if (cookie) {
        return cookieParse(cookie, socket) as number;
    } else if (token) {
        return verifyToken(token as string);
    } else {
        throw new Error("Authentication Error: No cookie found");
    }
};

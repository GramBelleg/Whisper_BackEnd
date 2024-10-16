import { Socket } from "socket.io";
import { cookieParse } from "@middlewares/socket.middleware";

export const validateCookie = (socket: Socket): number | undefined => {
    const cookie = socket.handshake.headers.cookie;
    if (cookie) {
        return cookieParse(cookie, socket) as number;
    } else {
        throw new Error("Authentication Error: No cookie found");
    }
};

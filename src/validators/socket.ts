import { Socket } from "socket.io";
import { cookieParse } from "@middlewares/socket.middleware";
import { verifyUserToken } from "@services/auth.service";

export const validateCookie = async (socket: Socket): Promise<number | undefined> => {
    const cookie = socket.handshake.headers.cookie;
    const token = socket.handshake.query.token;
    if (cookie) {
        return await cookieParse(cookie, socket) as number;
    } else if (token) {
        return await verifyUserToken((token as string).replace("Bearer", "").trim());
    } else {
        console.log("Authentication Error: No cookie found");
        return undefined;
    }
};

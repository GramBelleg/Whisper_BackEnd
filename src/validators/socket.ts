import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import { cookieParse } from "@middlewares/socket.middleware";
import { verifyUserToken } from "@services/auth/token.service";

export const validateCookie = async (socket: Socket): Promise<number | undefined> => {
    const cookie = socket.handshake.headers.cookie;
    const token = socket.handshake.query.token;
    if (cookie) {
        return (await cookieParse(cookie, socket)) as number;
    } else if (token) {
        return await verifyUserToken((token as string).replace("Bearer", "").trim());
    } else {
        throw new Error("Authentication Error: No cookie found");
    }
};

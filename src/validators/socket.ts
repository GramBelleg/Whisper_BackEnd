import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import { cookieParse } from "@middlewares/socket.middleware";
import { verifyUserToken } from "@services/auth/token.service";

export const validateCookie = async (socket: Socket): Promise<number | undefined> => {
    const cookie = socket.handshake.headers.cookie;
    // const token = socket.handshake.query.token;
    const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidGltZXN0YW1wIjoxNzMwNzUxNDg0MjAxLCJpYXQiOjE3MzA3NTE0ODQsImV4cCI6MTczMDc1NTA4NH0.BRRjtH2X5983RvPDqj6J2qR1bG1r8GMvT2OO4RASyYY";
    if (cookie) {
        return (await cookieParse(cookie, socket)) as number;
    } else if (token) {
        return await verifyUserToken((token as string).replace("Bearer", "").trim());
    } else {
        console.log("Authentication Error: No cookie found");
        return undefined;
    }
};

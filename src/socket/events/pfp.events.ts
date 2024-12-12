import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as pfpHandler from "@socket/handlers/pfp.handlers";
import { changePic } from "@services/user/user.service";
export const setupPfpEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "pfp",
        socketWrapper(async (user: { profilePic: string }) => {
            if (!user) throw new Error("No user given");
            if (user.profilePic == undefined) throw new Error("No Profile picture given");
            const profilePic = await changePic(userId, user.profilePic);
            if (profilePic != undefined) {
                await pfpHandler.broadCast(userId, clients, "pfp", { userId, profilePic });
            }
        })
    );
};

import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as connectionHandler from "@socket/handlers/connection.handlers";
import { Status } from "@prisma/client";

//Need it to implement Away status from the frontEnd

export const setupStatusEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "status",
        socketWrapper(async (data: { status: Status }) => {
            if (!data || !data.status) throw new Error("No Status given");
            await connectionHandler.broadCast(userId, clients, data.status);
        })
    );
};

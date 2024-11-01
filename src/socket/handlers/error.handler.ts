import { Socket } from "socket.io";

export const socketWrapper = (handler: Function) => {
    return async function (this: Socket | void, ...args: any[]) {
        const socket: Socket = this ? this : args[0];
        try {
            return await handler(...args);
        } catch (err: Error | any) {
            process.env.NODE_ENV === "development"
                ? console.log("Socket error:", err.message)
                : undefined;
            socket.emit("error", {
                message: err.message || "Something went wrong",
                stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
            });
        }
    };
};

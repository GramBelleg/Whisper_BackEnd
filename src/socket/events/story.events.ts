import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as storyTypes from "@models/story.models";
import * as storyController from "@controllers/user/story.controller";
import * as storyHandler from "@socket/handlers/story.handlers";

export const setupStoryEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "uploadStory",
        socketWrapper(async (story: storyTypes.omitId) => {
            const createdStory = await storyController.setStory({
                ...story,
                userId,
            });
            if (createdStory) {
                await storyHandler.broadCast(userId, clients, "receiveStory", createdStory);
            }
        })
    );

    socket.on(
        "deleteStory",
        socketWrapper(async (storyId: number) => {
            await storyController.deleteStory(storyId);
            await storyHandler.broadCast(userId, clients, "deleteStory", storyId);
        })
    );
};

import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as storyTypes from "@models/story.models";
import * as storyController from "@controllers/story/story.controller";
import * as storyHandler from "@socket/handlers/story.handlers";
import { displayedUser } from "@services/user/user.service";

//note the userId is the id of the user who is sending on the socket

export const setupStoryEvents = (socket: Socket, userId: number, clients: Map<number, Socket>) => {
    socket.on(
        "story",
        socketWrapper(async (story: storyTypes.body) => {
            try {
                const createdStory = await storyController.setStory({
                    ...story,
                    userId: userId,
                });

                if (createdStory) {
                    await storyHandler.postStory(clients, "story", createdStory);
                }
            } catch (e: any) {
                throw new Error("Failed to create story");
            }
        })
    );

    socket.on(
        "deleteStory",
        socketWrapper(async (story: { storyId: number }) => {
            const deletedStory = await storyController.deleteStory(userId, story.storyId);
            if (deletedStory) await storyHandler.deleteStory(clients, "deleteStory", deletedStory);
        })
    );

    socket.on(
        "likeStory",
        socketWrapper(
            async (data: {
                storyId: number;
                userName: string;
                profilePic: string;
                liked: boolean;
            }) => {
                await storyController.likeStory(userId, data.storyId, data.liked);
                await storyHandler.likeStory(clients, "likeStory", {
                    userId,
                    storyId: data.storyId,
                    liked: data.liked,
                });
            }
        )
    );

    socket.on(
        "viewStory",
        socketWrapper(async (data: { storyId: number; userName: string; profilePic: string }) => {
            await storyController.viewStory(userId, data.storyId);
            await storyHandler.viewStory(clients, "viewStory", {
                userId,
                storyId: data.storyId,
            });
        })
    );
};

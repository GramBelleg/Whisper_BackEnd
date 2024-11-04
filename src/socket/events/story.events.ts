import { Socket } from "socket.io";
import { socketWrapper } from "@socket/handlers/error.handler";
import * as storyTypes from "@models/story.models";
import * as storyController from "@controllers/story/story.controller";
import * as storyHandler from "@socket/handlers/story.handlers";
import { Privacy } from "@prisma/client";

//note the connectedUserId is the id of the user who is sending on the socket

export const setupStoryEvents = (
    socket: Socket,
    connectedUserId: number,
    clients: Map<number, Socket>
) => {
    socket.on(
        "story",
        socketWrapper(async (story: storyTypes.body) => {
            try {
                const createdStory = await storyController.setStory({
                    ...story,
                    userId: connectedUserId,
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
        socketWrapper(async (storyId: number) => {
            try {
                const deletedStory = await storyController.deleteStory(connectedUserId, storyId);
                if (deletedStory)
                    await storyHandler.deleteStory(clients, "deleteStory", deletedStory);
            } catch (e: any) {
                throw new Error("Failed to delete story");
            }
        })
    );

    socket.on(
        "likeStory",
        socketWrapper(
            async (userId: number, storyId: number, userName: string, profilePic: string) => {
                try {
                    await storyController.likeStory(connectedUserId, storyId);
                    await storyHandler.likeStory(userId, clients, "likeStory", {
                        userId: connectedUserId,
                        storyId: storyId,
                        userName: userName,
                        profilePic: profilePic,
                    });
                } catch (e: any) {
                    throw new Error("Failed to like story");
                }
            }
        )
    );

    socket.on(
        "viewStory",
        socketWrapper(
            async (userId: number, storyId: number, userName: string, profilePic: string) => {
                try {
                    await storyController.viewStory(connectedUserId, storyId);
                    await storyHandler.viewStory(userId, clients, "viewStory", {
                        userId: connectedUserId,
                        storyId: storyId,
                        userName: userName,
                        profilePic: profilePic,
                    });
                } catch (e: any) {
                    throw new Error("Failed to view story");
                }
            }
        )
    );
};

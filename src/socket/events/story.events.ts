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
                console.log(story);
                const createdStory = await storyController.setStory({
                    ...story,
                    userId: connectedUserId,
                });
                console.log(story);

                if (createdStory) {
                    await storyHandler.postStory(clients, "story", createdStory);
                }
                console.log(story);
            } catch (e: any) {
                throw new Error("Failed to create story");
            }
        })
    );

    socket.on(
        "deleteStory",
        socketWrapper(async (story: { storyId: number }) => {
            const deletedStory = await storyController.deleteStory(connectedUserId, story.storyId);
            if (deletedStory) await storyHandler.deleteStory(clients, "deleteStory", deletedStory);
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

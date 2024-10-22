/**
 * @swagger
 * paths:
 *  /api/chats:
 *   post:
 *     summary: Get chats for a user
 *     operationId: getChats
 *     tags:
 *      - Chat
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: Array of chats for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   type:
 *                     type: string
 *                   unreadMessageCount:
 *                     type: integer
 *                     nullable: true
 *                   lastMessageId:
 *                     type: integer
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       chatId:
 *                         type: integer
 *                       senderId:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       forwarded:
 *                         type: boolean
 *                       pinned:
 *                         type: boolean
 *                       selfDestruct:
 *                         type: boolean
 *                       expiresAfter:
 *                         type: integer
 *                         nullable: true
 *                       type:
 *                         type: string
 *                       parentMessageId:
 *                         type: integer
 *                         nullable: true
 *  /api/chats/{chatId}:
 *   get:
 *     summary: Get messages for a specific chat
 *     operationId: getMessages
 *     tags:
 *      - Message
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: chatId
 *        required: true
 *        description: The ID of the chat to retrieve messages from
 *        schema:
 *          type: integer
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       404:
 *         description: Chat not found
 *       200:
 *         description: Array of message objects for the given chatId
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   chatId:
 *                     type: integer
 *                   senderId:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   forwarded:
 *                     type: boolean
 *                   pinned:
 *                     type: boolean
 *                   selfDestruct:
 *                     type: boolean
 *                   expiresAfter:
 *                     type: integer
 *                     nullable: true
 *                   type:
 *                     type: string
 *                   parentMessageId:
 *                     type: integer
 *                     nullable: true
 */

import { Router } from "express";
import asyncHandler from "express-async-handler";
import { handleGetAllChats } from "@controllers/chat/get.chats";
import { handleGetAllMessages } from "@controllers/chat/get.messages";

const router: Router = Router();

router.route("/").get(asyncHandler(handleGetAllChats));
router.route("/:chatId").get(asyncHandler(handleGetAllMessages));

export default router;

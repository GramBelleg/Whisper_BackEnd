/**
 * @swagger
 * paths:
 *  /api/chats/{chatId}:
 *   get:
 *     summary: Get messages for a specific chat
 *     operationId: getMessages
 *     tags:
 *      - Chat
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
 *                   sentAt:
 *                     type: string
 *                     format: date-time
 *                   read:
 *                     type: boolean
 *                   delivered:
 *                     type: boolean
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
 *                   parentMessage:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                       media:
 *                         type: string
 */

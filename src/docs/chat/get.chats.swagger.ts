/**
 * @swagger
 * paths:
 *  /api/chats:
 *   get:
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
 */

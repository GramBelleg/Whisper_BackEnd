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
 *                   other:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *                       hasStory:
 *                         type: boolean
 *                       isMuted:
 *                         type: boolean
 *                   type:
 *                     type: string
 *                   unreadMessageCount:
 *                     type: integer
 *                     nullable: true
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       type:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       sentAt:
 *                         type: string
 *                         format: date-time
 *                       read:
 *                         type: boolean
 *                       delivered:
 *                         type: boolean
 */

/**
 * @swagger
 * /chat/media:
 *   post:
 *     summary: Retrieve specific media type messages from a chat
 *     description: Get messages of a specific media type (image, video, or link) from personal, group, or channel chats.
 *     tags:
 *       - Media
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - type
 *             properties:
 *               chatId:
 *                 type: integer
 *                 example: 12345
 *                 description: The identifier of the chat from which to retrieve media messages.
 *               type:
 *                 type: string
 *                 enum:
 *                   - image
 *                   - video
 *                   - link
 *                 description: The type of media to filter messages by.
 *     responses:
 *       200:
 *         description: Media messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   messageId:
 *                     type: integer
 *                     description: The identifier of the message containing the media.
 *                   media:
 *                     type: string
 *                     description: The URL or path of the media file.
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the media message was sent.
 *       400:
 *         description: Bad request, invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Invalid chatId or media type."
 *       404:
 *         description: No media messages found for the given type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "No media messages found for the specified type."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving media messages."
 */

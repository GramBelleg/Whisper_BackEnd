/**
 * @swagger
 * /messages/global-search:
 *   post:
 *     summary: Search for specific messages within global search (if public)
 *     description: Retrieve a list of messages that match the given search query across all public chats.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Hello world"
 *                 description: The search term to find specific messages.
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   messageId:
 *                     type: integer
 *                     description: The unique identifier of the message.
 *                   content:
 *                     type: string
 *                     description: The content of the message.
 *                   chatId:
 *                     type: integer
 *                     description: The identifier of the chat where the message was sent.
 *                   chatName:
 *                     type: string
 *                     description: The name of the chat where the message was sent.
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
 *                   example: "Invalid search criteria."
 *       404:
 *         description: No messages found matching the search criteria
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
 *                   example: "No messages found matching the search criteria."
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
 *                   example: "An error occurred while searching for messages."
 */

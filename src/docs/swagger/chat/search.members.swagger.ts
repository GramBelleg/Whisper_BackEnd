/**
 * @swagger
 * /groups/search/members:
 *   get:
 *     summary: Search for group members
 *     description: Search for members in a specific group based on a query string.
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the group for which to search members.
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The search query to find group members by username or other attributes.
 *     responses:
 *       200:
 *         description: Group members retrieved successfully matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: The unique identifier of the group member.
 *                   userName:
 *                     type: string
 *                     description: The username of the group member.
 *                   profilePic:
 *                     type: string
 *                     description: URL of the group member's profile picture.
 *       400:
 *         description: Bad request, invalid search query or chatId
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
 *                   example: "Invalid search query or chatId provided."
 *       404:
 *         description: No matching group members found
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
 *                   example: "No group members found matching the search query."
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
 *                   example: "An error occurred while searching for group members."
 */

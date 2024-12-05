/**
 * @swagger
 * /chat/{chatId}/members:
 *   get:
 *     summary: View a list of group members
 *     description: Retrieve detailed information about the members of a specific group.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The identifier of the group for which to retrieve members.
 *     responses:
 *       200:
 *         description: Group members retrieved successfully
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
 *                   isAdmin:
 *                     type: boolean
 *                     description: Indicates if the group member is an admin.
 *                   lastSeen:
 *                     type: string
 *                     format: date-time
 *                     description: The last seen timestamp of the group member.
 *       400:
 *         description: Bad request, invalid chat ID
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
 *                   example: "Invalid chat ID provided."
 *       404:
 *         description: Group not found
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
 *                   example: "Group not found."
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
 *                   example: "An error occurred while retrieving group members."
 */

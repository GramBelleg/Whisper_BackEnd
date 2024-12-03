/**
 * @swagger
 * /chat/search:
 *   post:
 *     summary: Search for public groups or channels by name
 *     description: Retrieve a list of public groups or channels that match the given name.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Gaming"
 *                 description: The name of the group or channel to search for.
 *     responses:
 *       200:
 *         description: Groups or channels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chatId:
 *                     type: integer
 *                     description: The identifier of the group or channel.
 *                   name:
 *                     type: string
 *                     description: The name of the group or channel.
 *                   picture:
 *                     type: string
 *                     description: The URL of the group's or channel's picture or logo.
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
 *         description: No groups or channels found matching the search criteria
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
 *                   example: "No public groups or channels found with the specified name."
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
 *                   example: "An error occurred while searching for groups or channels."
 */

/**
 * @swagger
 * /users/search:
 *   post:
 *     summary: Search for users by username, screen name, email, or phone
 *     description: Retrieve a list of users that match the given search query.
 *     tags:
 *       - Users
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
 *                 example: "john"
 *                 description: The search term to find users (could be username, screen name, email, or phone).
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userName:
 *                     type: string
 *                     description: The username of the user.
 *                   phone:
 *                     type: string
 *                     description: The phone number of the user.
 *                   screenName:
 *                     type: string
 *                     description: The screen name of the user.
 *                   email:
 *                     type: string
 *                     description: The email address of the user.
 *                   profilePic:
 *                     type: string
 *                     description: The URL of the user's profile picture.
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
 *         description: No users found matching the search criteria
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
 *                   example: "No users found matching the search criteria."
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
 *                   example: "An error occurred while searching for users."
 */

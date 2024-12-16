/**
 * @swagger
 * api/user/info:
 *   get:
 *     summary: Retrieve user information
 *     description: Retrieves detailed information about a user based on their email.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: The unique identifier for the user.
 *                   userName:
 *                     type: string
 *                     description: The name of the user.
 *                   profilePic:
 *                     type: string
 *                     format: uri
 *                     description: The URL of the user's profile picture.
 *       400:
 *         description: Error retrieving user information
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
 *                   example: "Error in Fetching Blocked Users"
 */

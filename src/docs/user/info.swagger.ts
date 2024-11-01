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
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: "user@example.com"
 *         description: The email of the user whose information is to be retrieved.
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     userName:
 *                       type: string
 *                       example: "johndoe123"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     bio:
 *                       type: string
 *                       example: "This is my bio."
 *                     profilePic:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     lastSeen:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-25T14:48:00.000Z"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
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
 *                   example: "User not found or email is invalid"
 */
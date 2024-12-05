/**
 * @swagger
 * /user/sessions:
 *   get:
 *     summary: Retrieve user session information
 *     description: Retrieves a list of active sessions for the authenticated user, including device and IP address.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   device:
 *                     type: string
 *                     example: "MacBook Pro"
 *                   IP:
 *                     type: string
 *                     example: "192.168.1.1"
 *                   token:
 *                      type: string
 *                      example: "4ec32f28fh9"
 *       401:
 *         description: Unauthorized access, invalid token
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
 *                   example: "Unauthorized access. Please provide a valid token."
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
 *                   example: "An error occurred while retrieving user sessions."
 */

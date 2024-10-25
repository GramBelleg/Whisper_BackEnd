/**
 * @swagger
 * api/user/email:
 *   put:
 *     summary: Update user's email address
 *     description: Updates the user's email address by verifying a code sent to the new email address.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "newuser@example.com"
 *                 description: The new email address to be set for the user.
 *               code:
 *                 type: string
 *                 example: "12345678"
 *                 description: The verification code sent to the new email.
 *     responses:
 *       200:
 *         description: Email updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   example: "newuser@example.com"
 *       400:
 *         description: Error updating email
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
 *                   example: "Invalid code or email update failed"
 */
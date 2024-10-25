/**
 * @swagger
 * api/user/profilepic:
 *   put:
 *     summary: Change user's profile picture
 *     description: Updates the user's profile picture with the specified blob name.
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
 *               blobName:
 *                 type: string
 *                 example: "profilePic.jpg"
 *                 description: The blob name of the new profile picture.
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 name:
 *                   type: string
 *                   example: "profilePic.jpg"
 *       400:
 *         description: Error updating profile picture
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
 *                   example: "Unable to update profile picture or invalid blob name"
 */
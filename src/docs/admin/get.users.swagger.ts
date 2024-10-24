/**
 * @swagger
 * paths:
 *  /api/admin/getUsers:
 *   get:
 *     summary: Get all users
 *     operationId: getUsers
 *     tags:
 *      - Admin
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: get all registered users in the application
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   name:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   profilePic:
 *                     type: string
 */

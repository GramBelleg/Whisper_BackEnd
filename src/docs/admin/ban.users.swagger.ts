/**
 * @swagger
 * paths:
 *  /api/admin/banUser:
 *   get:
 *     summary: Ban a user
 *     operationId: banUser
 *     tags:
 *      - Admin
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - userId
 *         properties:
 *          userId:
 *           type: integer
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: banned user successfully
 */

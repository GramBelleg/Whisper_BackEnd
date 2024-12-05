/**
 * @swagger
 * paths:
 *  /api/channels/permissions:
 *   post:
 *     summary: Set user Permissions
 *     operationId: setPermissions
 *     tags:
 *      - Channel
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          userId:
 *           type: integer
 *          chatId:
 *           type: integer
 *          comment:
 *           edit: boolean
 *          download:
 *           type: boolean
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: User permissions updated
 */

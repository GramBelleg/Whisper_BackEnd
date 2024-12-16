/**
 * @swagger
 * paths:
 *  /api/chats/privacy:
 *   post:
 *     summary: Set user Permissions
 *     operationId: setPermissions
 *     tags:
 *      - Chat
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          chatId:
 *           type: integer
 *          isMuted:
 *           edit: boolean
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: Muted Group
 */

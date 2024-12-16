/**
 * @swagger
 * paths:
 *  /api/groups/permissions:
 *   post:
 *     summary: Set user Permissions
 *     operationId: setPermissions
 *     tags:
 *      - Group
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
 *          post:
 *           edit: boolean
 *          edit:
 *           edit: boolean
 *          delete:
 *           type: boolean
 *          download:
 *           type: boolean
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: User permissions updated
 */

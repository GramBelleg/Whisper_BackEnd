/**
 * @swagger
 * paths:
 *  /api/channels/privacy:
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
 *          chatId:
 *           type: integer
 *          public:
 *           edit: boolean
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: Channel privacy updated
 */

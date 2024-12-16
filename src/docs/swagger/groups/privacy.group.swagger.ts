/**
 * @swagger
 * paths:
 *  /api/groups/privacy:
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
 *          chatId:
 *           type: integer
 *          public:
 *           edit: boolean
 *     responses:
 *       400:
 *         $ref: "#/components/responses/requestError"
 *       200:
 *         description: Group privacy updated
 */

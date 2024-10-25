/**
 * @swagger
 * paths:
 *  /api/user/logoutOne:
 *   get:
 *    summary: Logout from current device and delete token cookie of current device
 *    operationID: Logout One
 *    security:
 *     - cookieAuth: []
 *    tags:
 *     - User
 *    responses:
 *      401:
 *       $ref: "#/components/responses/requestError"
 *      400:
 *       $ref: "#/components/responses/requestError"
 *      200:
 *        content:
 *         application/json:
 *          schema:
 *           type: object
 *           properties:
 *            status:
 *             type: string
 *            message:
 *             type: string
 *
 *  /api/user/logoutAll:
 *   get:
 *    summary: Logout from all devices of this user and delete token cookie of current device
 *    operationID: Logout All
 *    security:
 *     - cookieAuth: []
 *    tags:
 *     - User
 *    responses:
 *      401:
 *       $ref: "#/components/responses/requestError"
 *      400:
 *       $ref: "#/components/responses/requestError"
 *      200:
 *        content:
 *         application/json:
 *          schema:
 *           type: object
 *           properties:
 *            status:
 *             type: string
 *            message:
 *             type: string
 *
 */
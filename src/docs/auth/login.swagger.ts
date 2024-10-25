/**
 * @swagger
 * paths:
 *  /api/auth/login:
 *   post:
 *     summary: Try to login the application
 *     operationID: Login
 *     tags:
 *      - Authentication - Registration
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *          - email
 *          - password
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *          password:
 *           type: string
 *           format: password
 *           minLength: 6 characters
 *           maxLength: 50 characters
 *     responses:
 *       400:
 *        $ref: "#/components/responses/requestError"
 *       200:
 *         description: data of successful response
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                status:
 *                 type: string
 *                userToken:
 *                 type: string
 *                 description: token which will be used in authentication inside application
 *                user:
 *                 type: object
 *                 properties:
 *                  id:
 *                   type: integer
 *                  name:
 *                   type: string
 *                  userName:
 *                   type: string
 *                  email:
 *                   type: string
 *                   format: email
 *
 */

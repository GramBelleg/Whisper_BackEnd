/**
 * @swagger
 * paths:
 *  /api/auth/resendConfirmCode:
 *   post:
 *     summary: Generate and resend confirmation code to confirm user's email to add new account
 *     operationID: Send Confrimation Code
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
 *         properties:
 *          email:
 *           type: string
 *           format: email
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
 *
 *  /api/auth/confirmEmail:
 *   post:
 *     summary: Verify code to confirm user's email
 *     operationID: Confirm Email
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
 *          - code
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *          code:
 *           type: string
 *           length: 8 characters
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

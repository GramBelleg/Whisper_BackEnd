/**
 * @swagger
 * paths:
 *  /api/auth/sendResetCode:
 *   post:
 *     summary: Generate and send reset code to change user's password
 *     operationID: Send Reset Code
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
 *  /api/auth/resetPassword:
 *   post:
 *     summary: Verify code to change user's password
 *     operationID: Change Password
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
 *          - confirmPassword
 *          - code
 *         properties:
 *          email:
 *           type: string
 *           format: email
 *          password:
 *           type: string
 *           format: password
 *           minLength: 6 characters
 *           maxLength: 50 characters
 *          confirmPassword:
 *           type: string
 *           format: password
 *           description: the same password for confirmation
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

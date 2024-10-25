/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Chat WebSocket API
 *   description: WebSocket API for real-time chat features, including sending, editing, pinning, unpinning, and deleting messages.
 *   version: 1.0.0
 *
 * tags:
 *   - name: WebSocket
 *     description: WebSocket events for real-time chat functionality
 *
 * components:
 *   schemas:
 *     SentMessage:
 *       type: object
 *       properties:
 *         messageId:
 *           type: integer
 *           description: Unique identifier for the message
 *         chatId:
 *           type: integer
 *           description: Identifier of the chat room where the message was sent
 *         content:
 *           type: string
 *           description: The content of the message
 *         senderId:
 *           type: integer
 *           description: The ID of the user who sent the message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Time when the message was sent
 *
 *     EditableMessage:
 *       type: object
 *       properties:
 *         messageId:
 *           type: integer
 *           description: Unique identifier for the message to be edited
 *         content:
 *           type: string
 *           description: New content of the message
 *
 *     MessageReference:
 *       type: object
 *       properties:
 *         messageId:
 *           type: integer
 *           description: Unique identifier for the message to be pinned or unpinned
 *         chatId:
 *           type: integer
 *           description: Identifier of the chat room where the message resides
 *
 *     DeleteMessages:
 *       type: object
 *       properties:
 *         Ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of message IDs to delete
 *         chatId:
 *           type: integer
 *           description: ID of the chat room where the messages are being deleted
 *
 *   callbacks:
 *     WebSocketEvents:
 *       send:
 *         '{$request.body.chatId}':
 *           post:
 *             summary: Send a new message
 *             operationId: sendMessage
 *             tags:
 *               - WebSocket
 *             requestBody:
 *               description: The message details to send in the chat
 *               required: true
 *               content:
 *                 application/json:
 *                   schema:
 *                     $ref: '#/components/schemas/SentMessage'
 *             responses:
 *               '200':
 *                 description: Message sent successfully
 *                 content:
 *                   application/json:
 *                     schema:
 *                       $ref: '#/components/schemas/SentMessage'
 *
 *       edit:
 *         '{$request.body.messageId}':
 *           post:
 *             summary: Edit a message
 *             operationId: editMessage
 *             tags:
 *               - WebSocket
 *             requestBody:
 *               description: Updated message content
 *               required: true
 *               content:
 *                 application/json:
 *                   schema:
 *                     $ref: '#/components/schemas/EditableMessage'
 *             responses:
 *               '200':
 *                 description: Message edited successfully
 *                 content:
 *                   application/json:
 *                     schema:
 *                       $ref: '#/components/schemas/EditableMessage'
 *
 *       pin:
 *         '{$request.body.messageId}':
 *           post:
 *             summary: Pin a message
 *             operationId: pinMessage
 *             tags:
 *               - WebSocket
 *             requestBody:
 *               description: The message reference to pin
 *               required: true
 *               content:
 *                 application/json:
 *                   schema:
 *                     $ref: '#/components/schemas/MessageReference'
 *             responses:
 *               '200':
 *                 description: Message pinned successfully
 *
 *       unpin:
 *         '{$request.body.messageId}':
 *           post:
 *             summary: Unpin a message
 *             operationId: unpinMessage
 *             tags:
 *               - WebSocket
 *             requestBody:
 *               description: The message reference to unpin
 *               required: true
 *               content:
 *                 application/json:
 *                   schema:
 *                     $ref: '#/components/schemas/MessageReference'
 *             responses:
 *               '200':
 *                 description: Message unpinned successfully
 *
 *       delete:
 *         '{$request.body.chatId}':
 *           post:
 *             summary: Delete messages
 *             operationId: deleteMessages
 *             tags:
 *               - WebSocket
 *             requestBody:
 *               description: Array of message IDs to delete and chat room ID
 *               required: true
 *               content:
 *                 application/json:
 *                   schema:
 *                     $ref: '#/components/schemas/DeleteMessages'
 *             responses:
 *               '200':
 *                 description: Messages deleted successfully
 *
 * paths:
 *   /ws/chat:
 *     post:
 *       tags:
 *         - WebSocket
 *       summary: Establish WebSocket connection for chat
 *       description: Initialize WebSocket connection to handle real-time chat interactions.
 *       responses:
 *         '101':
 *           description: Switching protocols, WebSocket connection established
 */

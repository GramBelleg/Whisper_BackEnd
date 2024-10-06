"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_routes_1 = __importDefault(require("@routes/index-routes"));
const swagger_1 = __importDefault(require("./swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const web_socket_1 = require("@socket/web-socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: "*", // Allow this origin to send request to server and recieve response from server
    credentials: true, // Allow cookies to be sent in cross-origin requests
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use("/api", index_routes_1.default);
(0, web_socket_1.initWebSocketServer)(server);
server.listen(parseInt(process.env.PORT), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});

import io from "socket.io-client"; // For client-side types
import { server, closeApp } from "@src/app";
import * as storyController from "@controllers/story/story.controller";
import * as storyHandler from "@socket/handlers/story.handlers";
import * as connectionHandler from "@socket/handlers/connection.handlers";
import { validateCookie } from "@validators/socket";


jest.mock("@validators/socket");
jest.mock("@socket/handlers/story.handlers");
jest.mock("@socket/handlers/connection.handlers");
jest.mock("@controllers/story/story.controller");

beforeAll(() => {
  server.listen(5000);
});

afterAll(async () => {
  server.close();
  await closeApp();
});
describe("Story event", () => {
  const mockStory = { contend: "test Story", media: "test media", type: "test type" }; // Replace with your actual story shape
  const connectedUserId = "user-123";

  beforeAll(() => {
    jest.clearAllMocks();
  });

  

  it("should handle 'story' event correctly", async () => {
    (validateCookie as jest.Mock).mockResolvedValue(connectedUserId);
    (storyController.deleteStory as jest.Mock).mockResolvedValue(mockStory);
    (storyHandler.deleteStory as jest.Mock).mockResolvedValue(undefined);
    (connectionHandler.startConnection as jest.Mock).mockResolvedValue(undefined);
    const port = 5000;
    const clientSocket = io(`http://localhost:${port}`);
    clientSocket.emit("deleteStory", { token: "valid token" });
    await new Promise((resolve) => setTimeout(resolve, 4500));
    expect(validateCookie).toHaveBeenCalled();
    expect(storyController.deleteStory).toHaveBeenCalled();
    expect(storyHandler.deleteStory).toHaveBeenCalled();

    clientSocket.disconnect();
  });

});

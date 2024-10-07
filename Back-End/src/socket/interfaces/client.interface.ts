import { Socket } from "socket.io";

export default interface Client {
  id: string;
  socket: Socket;
}

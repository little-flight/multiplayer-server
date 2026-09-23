import { WebSocketServer } from "ws";

import { Player } from "./player.js";
import { RoomManager } from "./room.js";

const port = process.env.PORT || 8000;
const server = new WebSocketServer({ port });
const roomsManager = new RoomManager();
const players = {};

server.on("connection", (socket) => {
  const player = new Player(socket, roomsManager);
  players[player.id] = player;
});


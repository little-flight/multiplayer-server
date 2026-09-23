import { uuid } from "./utils.js";

class Room {
  constructor (id) {
    this.id = id;
    this.seed = uuid();
    this.players = {};
    this.startTime = Date.now();
    this.roomVacancy = 10;
  }

  addPlayer(player) {
    if (this.roomVacancy <= 0)
      return false;

    this.players[player.id] = player;
    this.roomVacancy--;

    return true;
  }

  removePlayer(player) {
    if (!this.players[player.id])
      return false;

    delete this.players[player.id];
    this.roomVacancy++;

    return true;
  }

  get time() {
    const GAME_DAY_TIMESTAMP = 120000;

    return Date.now() - this.startTime + GAME_DAY_TIMESTAMP;
  }
}

export class RoomManager {
  constructor () {
    this.rooms = {};
  }

  createRoom(roomId) {
    const room = new Room(roomId);
    this.rooms[roomId] = room;
  }

  join(roomId, player) {
    if (!this.rooms[roomId])
      this.createRoom(roomId);

    const room = this.rooms[roomId];

    if (!room.addPlayer(player))
      return null;

    return room;
  }
}


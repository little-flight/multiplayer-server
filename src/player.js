import { uuid } from "./utils.js";

export class Player {
  constructor (socket, roomsManager) {
    this.id = uuid();
    this.name = `Player ${this.id}`;
    this.room = null;
    this.socket = socket;
    this.roomsManager = roomsManager;
    this.registerSocketEvents();

    this.handlers = {
      updateDetails: (...args) => this.updateDetails(...args),
      joinRoom: (...args) => this.joinRoom(...args),
      planeState: (...args) => this.planeState(...args),
    }

    this.connectionSuccess();
  }

  meta() {
    return {
      id: this.id,
      name: this.name,
    };
  }

  registerSocketEvents() {
    this.socket.on('message', (...args) => this.handleMessage(...args));
    this.socket.on('close', (...args) => this.handleClose(...args));
  }

  sendData(type, data) {
    const message = { type, data };
    this.socket.send(JSON.stringify(message));
  }

  handleClose() {
    this.room?.removePlayer(this);
    const roomPlayers = Object.values(this.room.players);

    roomPlayers.forEach(p => {
      p.sendData("playerLeft", {
        playerId: this.id,
      });
    });
  }

  handleMessage (message) {
    const rawMessage = message.toString();
    const { type, data } = JSON.parse(rawMessage);
    this.handlers?.[type]?.(data);
  }

  updateDetails({ name }) {
    this.name = name;
  }

  connectionSuccess() {
    this.sendData("connectionSuccess", {
      status: "success",
      self: this.meta(),
    });
  }

  joinRoom({ roomId }) {
    this.room = this.roomsManager.join(roomId, this);
    const roomPlayers = Object.values(this.room.players);
    const players = roomPlayers.map(p => p.meta());

    this.sendData("joinRoom", {
      roomId: this.room.id,
      seed: this.room.seed,
      time: this.room.time,
      self: this.meta(),
      players,
    });

    roomPlayers.forEach(p => {
      if (p.id === this.id) return;
      p.sendData("playerJoined", {
        player: this.meta(),
      });
    });
  }

  planeState({ state }) {
    if (this.room) {
      const players = Object.values(this.room.players);
      const otherPlayers = players.filter(p => p.id !== this.id);

      otherPlayers.forEach(p => p.sendData("planeState", {
        playerId: this.id,
        state,
      }));
    }
  }
}


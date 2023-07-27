import { genHexId } from "./utils/util";
import websocket from "websocket";
import http from "http";

export class WebSocketServer {
  clients: Record<string, websocket.connection>;

  wsServer: websocket.server;

  constructor() {
    const webSocketsServerPort = 8002;
    const webSocketServer = websocket.server;
    // Spinning the http server and the websocket server.
    const server = http.createServer();
    server.listen(webSocketsServerPort);
    this.wsServer = new webSocketServer({
      httpServer: server,
    });

    console.log("[WSS] Server Created");

    this.wsServer.on("request", (request) => {
      const userID = genHexId(32);
      console.log(
        "[WSS]" +
          new Date() +
          " Recieved a new connection from origin " +
          request.origin +
          "."
      );

      const connection = request.accept(null, request.origin); // origin ?
      this.clients[userID] = connection;
      console.log(
        "WSS connected: " +
          userID +
          " in " +
          Object.getOwnPropertyNames(this.clients)
      );

      // Message from the current user
      connection.on("message", (msg) => {
        console.log(msg);
      });
    });
  }

  subscribe(_clientId: string) {}
}

import { SERVER_CONFIG } from "./config/server-config";

import index from "../public/index.html";
import { generateUuid } from "./utils/generate-uuid";
import type { WebSocketData } from "./types";
import { handleMessage } from "./handlers/message.handler";

export const createServer = () => {
  const server = Bun.serve<WebSocketData>({
    port: SERVER_CONFIG.port,
    routes: {
      "/": index,
    },
    fetch(req, server) {
      // identificar nuestros clientes
      const clientId = generateUuid();

      const upgraded = server.upgrade(req, {
        data: { clientId },
      });

      if (upgraded) {
        return undefined;
      }

      // upgrade the request to a WebSocket
      // if (server.upgrade(req)) {
      //   return; // do not return a Response
      // }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      open(ws) {
        console.log(`Cliente: ${ws.data.clientId}`);
        ws.subscribe(SERVER_CONFIG.defaultChannelName);
        // todo: emitir el listado actual de los partidos
      },
      message(ws, message: string) {
        const response = handleMessage(message);
        const responseString = JSON.stringify(response);
        if (response.type === "ERROR") {
          ws.send(responseString);
          return;
        }

        if (response.type === "PARTIES_LIST") {
          ws.send(responseString);
          return;
        }

        ws.send(responseString);
        ws.publish(SERVER_CONFIG.defaultChannelName, responseString);
      }, // a message is received
      // a socket is opened
      close(ws, code, message) {
        console.log(`Cliente desconectado: ${ws.data.clientId}`);
        ws.unsubscribe(SERVER_CONFIG.defaultChannelName);
      }, // a socket is closed
      drain(ws) {}, // the socket is ready to receive more data
    }, // handlers
  });

  return server;
};

import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded || !(decoded as any).userId) {
      return null;
    }
    return (decoded as any).userId;
  } catch {
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  const user: User = { ws, rooms: [], userId };
  users.push(user);

  console.log(`✅ User connected: ${userId}`);

  ws.on("close", () => {
    const index = users.indexOf(user);
    if (index !== -1) users.splice(index, 1);
    console.log(`❌ User disconnected: ${userId}`);
  });

  ws.on("message", async (data) => {
    let parsedData;
    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      console.error("❌ Invalid JSON received");
      return;
    }

    const { type } = parsedData;
    console.log("📩 Message received:", type);

    if (type === "join_room") {
      user.rooms.push(parsedData.roomId);
      console.log(`📥 User ${userId} joined room ${parsedData.roomId}`);
    }

    if (type === "leave_room") {
      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
      console.log(`📤 User ${userId} left room ${parsedData.roomId}`);
    }

    if (type === "chat") {
      const { roomId, message } = parsedData;

      // ✅ Ensure message stored properly in DB
      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message: JSON.stringify(message),
          userId,
        },
      });

      // ✅ Broadcast only to users in same room
      users.forEach((u) => {
        if (
          u.rooms.includes(roomId) &&
          u.ws.readyState === WebSocket.OPEN
        ) {
          u.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            })
          );
        }
      });
    }

    if (type === "delete_shape") {
      const shapeId = parsedData.payload.id;
      const roomId = parsedData.payload.roomId;

      await prismaClient.chat.deleteMany({
        where: {
          roomId: Number(roomId),
          message: {
            contains: `"id":"${shapeId}"`,
          },
        },
      });

      users.forEach((u) => {
        if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(
            JSON.stringify({
              type: "delete_shape",
              payload: { id: shapeId, roomId },
            })
          );
        }
      });
    }

    if (type === "update_shape") {
      const { id, roomId, message } = parsedData.payload;

      await prismaClient.chat.updateMany({
        where: {
          roomId: Number(roomId),
          message: {
            contains: `"id":"${id}"`,
          },
        },
        data: {
          message: JSON.stringify(message),
        },
      });

      users.forEach((u) => {
        if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(
            JSON.stringify({
              type: "update_shape",
              payload: { id, roomId, message },
            })
          );
        }
      });
    }
  });
});

console.log(`🚀 WebSocket server running on port ${PORT}`);

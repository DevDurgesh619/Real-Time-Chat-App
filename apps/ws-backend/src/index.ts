import 'dotenv/config'; 
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
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  const user: User = { ws, rooms: [], userId };
  users.push(user);

  console.log(`User connected: ${userId}`);

  ws.on("close", () => {
    const index = users.indexOf(user);
    if (index !== -1) users.splice(index, 1);
    console.log(`User disconnected: ${userId}`);
  });

  ws.on("message", async (data) => {
    let parsedData;
    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      console.error("Invalid JSON received");
      return;
    }

    const { type } = parsedData;
    console.log("Message received:", type);

    if (type === "join_room") {
      user.rooms.push(parsedData.roomId);
      console.log(`User ${userId} joined room ${parsedData.roomId}`);
    }

    if (type === "leave_room") {
      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
      console.log(`User ${userId} left room ${parsedData.roomId}`);
    }

    if (type === "chat") {
      const { roomId, message } = parsedData;

      const userDetails = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message: message,
          userId,
        },
      });
      
      const payload = {
        type: "chat",
        message: {
            text: message,
            user: {
                id: userId,
                name: userDetails?.name || userDetails?.email || 'Anonymous'
            },
            timestamp: new Date()
        },
        roomId,
      };

      users.forEach((u) => {
        if (
          u.rooms.includes(roomId) &&
          u.ws.readyState === WebSocket.OPEN
        ) {
          u.ws.send(JSON.stringify(payload));
        }
      });
    }
  });
});

console.log(`WebSocket server running on port ${PORT}`);


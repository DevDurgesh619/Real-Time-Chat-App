import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const PORT = Number(process.env.PORT) || 8080; 
const wss = new WebSocketServer({ port: PORT });
interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch(e) {
    return null;
  }
  return null;
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })

  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parsedData.room);
    }

    console.log("message received")
    console.log(parsedData);

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const u_id = parsedData.message.shape.id

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId,
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId
          }))
        }
      })
    }
    if (parsedData.type === "delete_shape") {
        const shapeId = parsedData.payload.id;
        const roomId = parsedData.payload.roomId;
        await prismaClient.chat.deleteMany({
            where: {
                roomId: Number(roomId),
                message: {
                    contains: `"id":"${shapeId}"`
                }
            }
        });
        users.forEach(user => {
            if (user.rooms.includes(roomId)) {
                user.ws.send(JSON.stringify({
                    type: "delete_shape",
                    payload: {
                        id:shapeId,
                        roomId:roomId
                    }
                }));
            }
        });
    }
    if (parsedData.type === "update_shape") {
      const { id, roomId, message } = parsedData.payload;

      await prismaClient.chat.updateMany({
        where: {
          roomId: Number(roomId),
          message: {
            contains: `"id":"${id}"`
          }
        },
        data: {
          message 
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "update_shape",
            payload: {
              id,
              roomId,
              message
            }
          }));
        }
      });
    }



  });

});
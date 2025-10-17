import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { userMiddleware } from "./userMiddleware"; 
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"; 
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ msg: "Incorrect credentials", error: parsedData.error });
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                password: parsedData.data.password, //hash password
                name: parsedData.data.name
            }
        });
        res.status(201).json({ userId: user.id });
    } catch (e) {
        res.status(409).json({ msg: "User already exists with this username" });
        console.error("the error is: ",e)
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ msg: "Incorrect credentials" });
    }
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password // Compare hashed passwords in a real app
        }
    });
    if (!user) {
        return res.status(403).json({ msg: "Not Authorized" });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
});

app.post("/room", userMiddleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ msg: "Incorrect room name" });
    }
    try {
        //@ts-ignore
        const userId = req.userId;
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        });
        res.status(201).json({ roomId: room.id });
    } catch (e) {
        res.status(409).json({ msg: "Room already exists with this name" });
    }
});

app.get("/chat/:roomId", userMiddleware, async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: { roomId: roomId },
            include: { user: { select: { id: true, name: true, email: true } } }, // Include user details
            orderBy: { id: "asc" },
            take: 1000
        });
        res.json({ messages });
    } catch (e) {
        res.status(500).json({ messages: [] });
    }
});

app.get("/room/:slug", userMiddleware, async (req, res) => {
    try {
        const slug = req.params.slug;
        const room = await prismaClient.room.findFirst({ where: { slug } });
        if (!room) {
            return res.status(404).json({ msg: "Room not found" });
        }
        res.json({ roomId: room.id });
    } catch (e) {
        res.status(500).json({ msg: "Server error" });
    }
});

app.listen(3001, () => {
    console.log("HTTP server running on port 3001");
});

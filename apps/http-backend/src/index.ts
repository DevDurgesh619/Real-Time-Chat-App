import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { userMiddleware } from "./userMiddleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();
app.use(express.json());
import cors from "cors";

app.use(cors({
  origin: ["https://draw-app-frontend-six.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.post("/signup",async (req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        console.log(parsedData.error);
        res.json({
            msg:"incorrect credintials"
        })
        return
    }
    try{
        const user = await prismaClient.user.create({
            data:{
                email:parsedData.data?.username,
                password:parsedData.data?.password,
                name:parsedData.data?.name
            }
        })
        res.json({
            //@ts-ignore
            userId:user.id
        })
    }
    catch(e){
        res.status(411).json({msg:"user already exists with this usernamae"})
        console.error("This is the ERROR: ",e)
    }
})
app.post("/signin",async (req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        console.log(parsedData.error)
        res.json({
            msg:"incorrect credintials"
        })
    }
    const user = await prismaClient.user.findFirst({
        where:{
            email:parsedData.data?.username,
            password:parsedData.data?.password
        }
    })
    if(!user){
        res.status(403).json({msg:"not Authorized"})
        return
    }
    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);
    res.json({token})
})
app.post("/room",userMiddleware,async (req,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        console.log(parsedData.error)
        res.json({
            msg:"incorrect credintials"
        })
    }
    try{
        //@ts-ignore
        const userId = req.userId;
        const room = await prismaClient.room.create({
            data:{
                slug: parsedData.data?.name?? 'default slug',
                adminId:userId
            }
        })
        res.json({
            roomId:room.id
        })
    }
    catch(e){
        console.error("This is the ERROR: ",e)
        res.json({Msg:"Room already exists with this name"})

    }  
})
app.get("/chat/:roomId",async (req,res)=>{
    try{
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id:"desc"
            },
            take:1000
        }) 
        res.json({
            messages
        })
    }
    catch(e){
        console.error("THE ERROR is: ",e)
        res.json({
            messages:[]
        })
    }
})
app.get("/room/:slug",async (req,res)=>{
    try{
        const slug = req.params.slug;
        const room = await prismaClient.room.findFirst({
            where:{
                slug
            }
        })
        if(!room) return
        res.json({roomId:room.id})
    }
    catch(e){
        console.error("THIS is the ERROR: ",e)
    }
})
app.listen(3001)
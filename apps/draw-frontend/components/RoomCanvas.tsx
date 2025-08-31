"use client";

import { initDraw } from "@/app/draw";
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@/components/Canvas";

export function RoomCanvas({roomId}:{roomId:string}){
     
     const [socket,setSocket]= useState<WebSocket |null>(null);
     useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=${localStorage.getItem("token")}`);
          ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
     },[])
        

        if(!socket){
            return <div>
                connecting to server
            </div>
        }
        return (
        <div>
           <Canvas roomId={roomId} socket ={socket} />
        </div>
    )
}
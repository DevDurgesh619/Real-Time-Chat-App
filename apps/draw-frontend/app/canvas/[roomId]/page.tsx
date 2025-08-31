import {  RoomCanvas } from "@/components/RoomCanvas";
export  default async function CanvasPage({params}:{
    params:{
        roomId:string
    }
}){
    const roomId = (await params).roomId;
    console.log(roomId)
    console.log(typeof(roomId))
   return <RoomCanvas roomId={roomId}/>
}
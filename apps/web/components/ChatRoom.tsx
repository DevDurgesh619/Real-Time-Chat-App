import axios from "axios";
import { BACKEND_URL } from "../app/config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getMessages(roomId:string){
    const response = await axios.get(`${BACKEND_URL}/chat/${roomId}`,{
      params:{
        roomId
      }
    })
    return response.data.messages
}
export async function ChatRoom({id}:{id:string}){
  
  const initialMessages = await getMessages(id);
  const roomId = id;

  return  <ChatRoomClient messages={initialMessages} id={roomId}/>
} 
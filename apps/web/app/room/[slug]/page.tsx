
import axios from "axios"
import { BACKEND_URL } from "../../config"
import { ChatRoom } from "../../../components/ChatRoom";
async function getRoomId(slug:any){
  try {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`,{
      params:{
        slug
      }
    });
    return response.data.room.id
  }
  catch(e){
    
    console.error("getRoomId error for slug:", slug, e);
    return null;
  }
}
export default async function ChatRoomPage({
  params,
}: {
  params: { slug: string };
}){
  
  const  {slug}  = params;
  const roomId = await getRoomId(slug);
  if (!roomId) {
    // prevent crashing and make error obvious
    return <div>Could not load room. Invalid slug or server error.</div>;
  }

  return <ChatRoom id={roomId} />;
}


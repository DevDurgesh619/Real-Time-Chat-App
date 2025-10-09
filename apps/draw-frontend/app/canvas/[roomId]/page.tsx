import { RoomCanvas } from "@/components/RoomCanvas";

export default function CanvasPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  console.log(roomId);
  console.log(typeof roomId);
  return <RoomCanvas roomId={roomId} />;
}
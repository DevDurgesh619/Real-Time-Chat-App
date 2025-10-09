import { RoomCanvas } from "@/components/RoomCanvas";

type PageProps = {
  params: {
    roomId: string;
  };
};

export default function CanvasPage({ params }: PageProps) {
  const { roomId } = params;
  console.log(roomId);
  console.log(typeof roomId);
  return <RoomCanvas roomId={roomId} />;
}

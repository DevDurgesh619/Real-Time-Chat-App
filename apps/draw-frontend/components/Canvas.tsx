"use client"
import { initDraw } from "@/app/draw";
import { IconButton } from "./IconButton";
import { useEffect, useRef, useState } from "react";
import { ButtonMain } from "./ButtonMain";
import { Circle, Minus, RectangleHorizontalIcon,PencilLine ,Eraser,LassoSelect,Text} from "lucide-react";
import { Game } from "@/app/draw/Game";
export type Tool = "circle" | "rect" | "line" | "pencil" | "eraser" | "select" | "text";
export function Canvas({
    roomId,
    socket
}:
    {
        roomId:string,
        socket:WebSocket
    }){
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game,setGame] = useState<Game> ();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(()=>{
        game?.setTool(selectedTool);
    },[selectedTool,game]);

    useEffect(()=>{
                const canvas = canvasRef.current
                if (!canvas) return;
                const g = new Game(canvas,roomId,socket)
                setGame(g);
                return ()=>{
                    g.destroy()
                }
            },[canvasRef])
            console.log(selectedTool)
return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas style={{backgroundColor: "#000", display:"block"}} ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
}
function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div style={{
            position: "fixed",
            top: 10,
            left: 10
        }}>
            <div className="flex gap-t">
                <IconButton 
                    onClick={() => {
                        setSelectedTool("line")
                    }}
                    activated={selectedTool === "line"}
                    icon={<Minus />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
                <IconButton 
                    onClick={() => {
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<PencilLine />}
                />
                <IconButton 
                    onClick={() => {
                        setSelectedTool("eraser")
                    }}
                    activated={selectedTool === "eraser"}
                    icon={<Eraser/>}
                />
                <IconButton 
                    onClick={() => {
                        setSelectedTool("select")
                    }}
                    activated={selectedTool === "select"}
                    icon={<LassoSelect/>}
                />
                <IconButton 
                    onClick={() => {
                        setSelectedTool("text")
                    }}
                    activated={selectedTool === "text"}
                    icon={<Text/>}
                />
            </div>
        </div>
}
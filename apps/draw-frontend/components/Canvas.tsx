"use client"
import { initDraw } from "@/app/draw";
import { IconButton } from "./IconButton";
import { useEffect, useRef, useState } from "react";
import { ButtonMain } from "./ButtonMain";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
export type Tool = "circle" | "rect" | "pencil";
export function Canvas({
    roomId,
    socket
}:
    {
        roomId:string,
        socket:WebSocket
    }){
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    useEffect(()=>{
        //@ts-ignore
        window.selectedTool = selectedTool
    },[selectedTool]);
    useEffect(()=>{
                const canvas = canvasRef.current
                if (!canvas) return;
                initDraw(canvas,roomId,socket,)
            },[canvasRef])
            console.log(selectedTool)
return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
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
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
            </div>
        </div>
}
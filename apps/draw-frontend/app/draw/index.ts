import { BACKEND_URL } from "@/config";
import axios from "axios";
import { Socket } from "dgram";
type ShapeType = "rect" | "circle";
type Shape =
    {
      type: "rect";
      x: number;
      y: number;
      height: number;
      width: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }; 
let camera = {
  x: 0,     // pan offset X
  y: 0,     // pan offset Y
  scale: 1, // zoom level
};
export async function initDraw(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket){
            const ctx = canvas.getContext("2d");

            let existingShapes:Shape[]= await getExistingShapes(roomId) ;
            if(!ctx){
                return
            }
            let currentShapeType: ShapeType = "rect";
            const rectBtn = document.createElement("button");
            rectBtn.innerText = "Rectangle";
            rectBtn.style.marginRight = "10px";

            const circleBtn = document.createElement("button");
            circleBtn.innerText = "Circle";

            document.body.prepend(rectBtn, circleBtn);

            rectBtn.onclick = () => (currentShapeType = "rect");
            circleBtn.onclick = () => (currentShapeType = "circle");

            socket.onmessage =(event)=>{
                const message = JSON.parse(event.data);
                if(message.type === "chat"){
                    const parsedShape = JSON.parse(message.message);
                    existingShapes.push(parsedShape.shape);
                    clearCanvas(existingShapes, canvas, ctx, camera);
                }
            }
            clearCanvas(existingShapes, canvas, ctx, camera);
            let clicked = false;
            let startX = 0;
            let startY = 0;

            function getWorldCoords(e: MouseEvent, canvas: HTMLCanvasElement) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left - camera.x) / camera.scale;
                const y = (e.clientY - rect.top - camera.y) / camera.scale;
                return { x, y };
            }

            canvas.addEventListener("mousedown", (e) => {
                if (e.button === 0) {
                    clicked = true;
                    const pos = getWorldCoords(e, canvas);
                    startX = pos.x;
                    startY = pos.y;
                }
            });
            canvas.addEventListener("mouseup",(e)=>{
                if (clicked) {
                    clicked = false;
                    const pos = getWorldCoords(e, canvas);
                    const width = pos.x - startX;
                    const height = pos.y - startY;

                    let shape: Shape;
                    if (currentShapeType === "circle") {
                        const radius = Math.sqrt(width ** 2 + height ** 2);
                        shape = { type: "circle", centerX: startX, centerY: startY, radius };
                    } else {
                        shape = { type: "rect", x: startX, y: startY, width, height };
                    }

                    existingShapes.push(shape);
                    socket.send(
                        JSON.stringify({
                            type: "chat",
                            message: JSON.stringify({
                            shape,
                            }),
                            roomId,
                        })
                    );
                    clearCanvas(existingShapes, canvas, ctx, camera);
                }    
            })
            canvas.addEventListener("mousemove",(e)=>{
                if(clicked){
                    const pos = getWorldCoords(e, canvas);
                    const width = pos.x - startX;
                    const height = pos.y - startY;
                    clearCanvas(existingShapes, canvas, ctx, camera);
                    ctx.strokeStyle="rgba(255,255,255)"
                    if (currentShapeType === "circle") {
                        const radius = Math.sqrt(width ** 2 + height ** 2);
                        ctx.beginPath();
                        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                        ctx.stroke();
                        } else {
                        ctx.strokeRect(startX, startY, width, height);
                    }
                    
                }  
            })
            canvas.addEventListener("wheel", (e) => {
                if (e.ctrlKey) {
                //pinch zoom on trackpad or Ctrl+scroll
                e.preventDefault();
                const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
                const rect = canvas.getBoundingClientRect();

                //Zoom relative to mouse pointer
                const mouseX = (e.clientX - rect.left - camera.x) / camera.scale;
                const mouseY = (e.clientY - rect.top - camera.y) / camera.scale;

                camera.x -= mouseX * (zoomFactor - 1) * camera.scale;
                camera.y -= mouseY * (zoomFactor - 1) * camera.scale;
                camera.scale *= zoomFactor;
                } else {
                //two-finger scroll → pan
                e.preventDefault();
                camera.x -= e.deltaX;
                camera.y -= e.deltaY;
                }
                clearCanvas(existingShapes, canvas, ctx, camera);
            }, { passive: false });
    }

function clearCanvas(existingShapes:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,camera: { x: number; y: number; scale: number }){
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Apply camera transform
    ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.x, camera.y);
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="rgba(0,0,0)"
    ctx.lineWidth = 1 / camera.scale;
    existingShapes.map((shape)=>{
        if(shape.type==="rect"){
            ctx.strokeStyle="rgba(255,255,255)"
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    })
}
async function getExistingShapes(roomId:string){
    const res = await axios.get(`${BACKEND_URL}/chat/${roomId}`);
    const messages = res.data.messages;
    const Shapes = messages.map((x:{message:string})=>{
        const messageData = JSON.parse(x.message);
        return messageData.shape
    })
    return Shapes;
}
import { getExistingShapes } from "./getShape";
import { v4 as uuidv4 } from "uuid";
type Tool = "circle" | "rect" | "line" | "pencil" | "eraser" | "select" | "text";
type Shape =
    {
        id:string,
      type: "rect";
      x: number;
      y: number;
      height: number;
      width: number;
    }
  | {
       id:string,
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
    |{
        id: string,
        type:"line";
        x:number;
        y:number;
        endX:number;
        endY:number
    }
    |{
       id:string,
        type:"pencil";
        points:{x:number,y:number} [];
    }
    | {
      type: "text";
      id: string;
      x: number;
      y: number;
      content: string;
    };
export class Game {
    private canvas:HTMLCanvasElement;
    private ctx :CanvasRenderingContext2D
    private existingShapes : Shape[]
    private roomId:string
    private socket:WebSocket
    private clicked:boolean 
    private startX = 0;
    private startY = 0;
    private selectedTool:Tool = "circle";
    private currentPath :{x:number,y:number}[]= []
    private zoom = 1;
    private panOffset = { x: 0, y: 0 };
    private currentTool: Tool | "pan" = "circle";
    private isDragging = false;
    private dragStart = { x: 0, y: 0 };
    private dragOffset: { x: number; y: number };

    private selectedShapeId: string | null = null;
    private getMousePos = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };
    private keyDownHandler = (e: KeyboardEvent) => {
        if (e.key === " " && !e.repeat) {
            e.preventDefault(); 
            if (this.currentTool === "pan") {
                this.currentTool = "circle"; 
                this.canvas.style.cursor = "default";
            } else {
                this.currentTool = "pan";
                this.canvas.style.cursor = "grab";
            }
        }
    };
   private screenToWorld(screenX: number, screenY: number) {
    return {
        x: (screenX - this.panOffset.x) / this.zoom,
        y: (screenY - this.panOffset.y) / this.zoom
    };
}
private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const mousePos = this.getMousePos(e);
    const worldPosBeforeZoom = this.screenToWorld(mousePos.x, mousePos.y);
    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1; 
    const newZoom = this.zoom * (1 - direction * zoomIntensity);
    this.panOffset.x = mousePos.x - worldPosBeforeZoom.x * newZoom;
    this.panOffset.y = mousePos.y - worldPosBeforeZoom.y * newZoom;
    this.zoom = newZoom;
    this.clearCanvas();
}

    constructor(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket){
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")!;
        this.existingShapes= [];
        this.roomId = roomId;
        this.socket= socket;
        this.clicked = false;
        this.dragOffset = { x: 0, y: 0 };
        this.init();
        this.initHandlers();
        this.clearCanvas();
        this.initMouseHandlers();
        this.initKeyHandlers();
    }
    private initKeyHandlers() {
        window.addEventListener("keydown",this.keyDownHandler)
       
    }
    private isPointInShape(point: { x: number, y: number }, shape: Shape): boolean {
    if (shape.type === 'rect') {
        const x1 = Math.min(shape.x, shape.x + shape.width);
        const x2 = Math.max(shape.x, shape.x + shape.width);
        const y1 = Math.min(shape.y, shape.y + shape.height);
        const y2 = Math.max(shape.y, shape.y + shape.height);

        return point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2;
    }else if (shape.type === 'circle') {
        const dx = point.x - shape.centerX;
        const dy = point.y - shape.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
    }else if (shape.type === 'line') {
        const dist = (p1: {x: number, y: number}, p2: {x: number, y: number}) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const distToStart = dist(point, { x: shape.x, y: shape.y });
        const distToEnd = dist(point, { x: shape.endX, y: shape.endY });
        const lineLength = dist({ x: shape.x, y: shape.y }, { x: shape.endX, y: shape.endY });
        const buffer = 0.5; 
        return distToStart + distToEnd >= lineLength - buffer && distToStart + distToEnd <= lineLength + buffer;
    }else if (shape.type === 'pencil') {
        const dist = (p1: {x: number, y: number}, p2: {x: number, y: number}) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const buffer = 0.5; 
        for (let i = 1; i < shape.points.length; i++) {
            const startPoint = shape.points[i - 1];
            const endPoint = shape.points[i];
            
            const distToStart = dist(point, startPoint);
            const distToEnd = dist(point, endPoint);
            const segmentLength = dist(startPoint, endPoint);
            if (distToStart + distToEnd >= segmentLength - buffer && distToStart + distToEnd <= segmentLength + buffer) {
                return true;
            }
        }
    }else if (shape.type === 'text') {
        const textWidth = this.ctx.measureText(shape.content).width;
        const textHeight = 20; 
        return (
            point.x >= shape.x &&
            point.x <= shape.x + textWidth &&
            point.y >= shape.y - textHeight &&
            point.y <= shape.y
        );
}
    return false;
}

    destroy(){
        this.canvas.removeEventListener("mousedown",this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup",this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove",this.mouseMoveHandler)
        window.removeEventListener("keydown", this.keyDownHandler); 
        this.canvas.removeEventListener("wheel", this.handleWheel);
      
    }

    setTool(tool:"circle" | "rect" | "line" | "pencil" | "eraser" | "select" | "text"){
        this.selectedTool = tool;
    }
    async init(){
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }
    initHandlers(){
        this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            this.existingShapes.push(parsedShape.shape);
            this.clearCanvas();
        }

        if (message.type === "update_shape") {
            const updated = JSON.parse(message.payload.message).shape;
            const idx = this.existingShapes.findIndex(s => s.id === updated.id);
            if (idx !== -1) {
                this.existingShapes[idx] = updated; 
                this.clearCanvas();
            }
        }

        if (message.type === "delete_shape") {
            this.existingShapes = this.existingShapes.filter(s => s.id !== message.payload.id);
            this.clearCanvas();
        }
    };

    }
    clearCanvas(){
        this.ctx.save();
        // 2. Reset the transform and clear the entire screen
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 3. Restore the default state
        this.ctx.restore();

        // --- Apply our world transformations ---
        this.ctx.save();
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        this.ctx.scale(this.zoom, this.zoom);
        this.existingShapes.map((shape)=>{
            if (shape.id === this.selectedShapeId) {
                console.log("red called")
            this.ctx.strokeStyle = "yellow"; 
            this.ctx.fillStyle = "yellow"
            } else {
                this.ctx.strokeStyle = "white"; 
                this.ctx.fillStyle = "white"
            }
            if(shape.type==="rect"){
              this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
            }else if(shape.type==="circle"){
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX,shape.centerY,Math.abs(shape.radius),0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath(); 
            }else if(shape.type==="line"){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x,shape.y);
                this.ctx.lineTo(shape.endX,shape.endY);
                this.ctx.stroke();
                this.ctx.closePath(); 
            }else if (shape.type === "pencil") {
                if (shape.points.length > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }else if (shape.type === "text") {
                this.ctx.font = "20px Arial";
                this.ctx.fillText(shape.content, shape.x, shape.y);
            }
        })
         this.ctx.restore();
    }
    mouseDownHandler = (e:MouseEvent) => {
        this.isDragging = true;
        const pos = this.getMousePos(e);
        const worldPos = this.screenToWorld( pos.x, pos.y);
        
        this.dragStart.x =  worldPos.x;
        this.dragStart.y = worldPos.y;
        if (this.selectedTool === "select") {
            const mousePos = this.getMousePos(e);
            const worldPos = this.screenToWorld(mousePos.x, mousePos.y);
            for (let i = this.existingShapes.length - 1; i >= 0; i--) {
                const shape = this.existingShapes[i];
                if (this.isPointInShape(worldPos, shape)) {
                    console.log("pointincalled")
                    this.selectedShapeId = shape.id;
                    console.log(this.selectedShapeId)
                    this.isDragging = true; 
                    switch (shape.type) {
                        case 'rect':
                        case 'line':
                            this.dragOffset.x = worldPos.x - shape.x;
                            this.dragOffset.y = worldPos.y - shape.y;
                            break;
                        case 'circle':
                            this.dragOffset.x = worldPos.x - shape.centerX;
                            this.dragOffset.y = worldPos.y - shape.centerY;
                            break;
                        case 'pencil':
                            this.dragOffset.x = worldPos.x - shape.points[0].x;
                            this.dragOffset.y = worldPos.y - shape.points[0].y;
                            break;
                        case 'text':
                            this.dragOffset.x = worldPos.x - shape.x;
                            this.dragOffset.y = worldPos.y - shape.y;
                            break;
                    }
                    this.clearCanvas(); 
                    return; 
                }
            }
            this.selectedShapeId = null;
            this.clearCanvas();
            return;
        }
    if (this.currentTool === "pan") {
        this.canvas.style.cursor = "grabbing";
        this.startX = e.clientX; 
        this.startY = e.clientY;
        return;
    }
        this.clicked = true
        
        this.startX =  worldPos.x;
        this.startY= worldPos.y;
        if (this.selectedTool === "pencil") {
            this.currentPath = [{ x:  worldPos.x, y: worldPos.y }];
            this.ctx.beginPath();
            this.ctx.moveTo( worldPos.x, worldPos.y);
        }
    }
    mouseUpHandler = (e:MouseEvent) => {
        this.isDragging = false;

    // Handle panning end
        if (this.currentTool === "pan") {
            this.canvas.style.cursor = "grab";
            return;
        }
        this.clicked = false
        if (this.selectedTool === "select" && this.selectedShapeId) {
        const selectedShape = this.existingShapes.find(s => s.id === this.selectedShapeId);
        if (selectedShape) {
            this.socket.send(JSON.stringify({
                type: "update_shape",
                payload: { 
                    id: selectedShape.id,
                    roomId: this.roomId,
                    message: JSON.stringify({ shape: selectedShape })
                }
            }));
        }
    }
        const pos = this.getMousePos(e);
        const worldPos = this.screenToWorld( pos.x, pos.y);
        const width =  worldPos.x - this.startX;
        const height = worldPos.y- this.startY
        let shape :Shape | null = null;
        //@ts-ignore
        const selectedTool = this.selectedTool
        if(selectedTool ==="rect"){
            shape = {
            id: uuidv4(),
            type:"rect",
            x:this.startX,
            y:this.startY,
            width,
            height
            } 
        }else if(selectedTool==="circle"){
            const radius = (Math.sqrt(Math.pow(width,2)+Math.pow(height,2))/2);
            shape = {
                //@ts-ignore
            id: uuidv4(),
            type:"circle",
            centerX:(this.startX +  worldPos.x)/2,
            centerY:(this.startY +worldPos.y)/2,
            radius
            } 
        }else if(selectedTool==="line"){
            shape = {
                //@ts-ignore
            id: uuidv4(),
            type:"line",
            x:this.startX,
            y:this.startY,
            endX: worldPos.x,
            endY:worldPos.y
            } 
        }else if(selectedTool ==="pencil"){
            shape = {
                  //@ts-ignore
            id: uuidv4(),
            type:"pencil",
            points:this.currentPath
            } 
            this.ctx.closePath();
        }else if (selectedTool === "text") {
            const pos = this.getMousePos(e);
            const worldPos = this.screenToWorld(pos.x, pos.y);

            // Create a temporary input
            const input = document.createElement("input");
            input.type = "text";
            input.style.position = "absolute";
            input.style.left = `${pos.x}px`;   // screen coords
            input.style.top = `${pos.y}px`;
            input.style.background = "transparent";
            input.style.border = "none";
            input.style.color = "white";
            input.style.font = "20px Arial";
            input.style.outline = "none";

            document.body.appendChild(input);
            input.focus();
            input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                ev.preventDefault();
                input.blur(); // finish typing
            }
            if (ev.key === " ") {
                ev.stopPropagation(); // allow space to work inside input
            }
            });
            input.onblur = () => {
                const text = input.value.trim();
                if (text) {
                     shape = {
                        // @ts-ignore
                        id: uuidv4(),
                        type: "text",
                        x: worldPos.x,
                        y: worldPos.y,
                        content: text
                    };

                    this.socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({ shape }),
                        roomId: this.roomId
                    }));

                    this.clearCanvas();
                }
                document.body.removeChild(input);
            };

            input.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter") {
                    input.blur(); // save on enter
                }
            });
        }

        if(!shape) return;
        this.socket.send(JSON.stringify({
            type:"chat",
            message: JSON.stringify({
                shape
            }),
            roomId:this.roomId
        }))
    }
    mouseMoveHandler = (e: MouseEvent) => {
    if (!this.isDragging) return;
        if (this.currentTool === "pan") {
            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;
            this.panOffset.x += dx;
            this.panOffset.y += dy;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.clearCanvas(); 
            return;
        }
    switch (this.selectedTool) {
        case 'select':
            if (this.selectedShapeId) {
                const selectedShape = this.existingShapes.find(s => s.id === this.selectedShapeId);
                if (!selectedShape) break;
                const mousePos = this.getMousePos(e);
                const worldPos = this.screenToWorld(mousePos.x, mousePos.y);
                const newAnchorX = worldPos.x - this.dragOffset.x;
                const newAnchorY = worldPos.y - this.dragOffset.y;
                switch (selectedShape.type) {
                    case 'rect':
                        selectedShape.x = newAnchorX;
                        selectedShape.y = newAnchorY;
                        break;
                    case 'circle':
                        selectedShape.centerX = newAnchorX;
                        selectedShape.centerY = newAnchorY;
                        break;
                    case 'line':
                        const lineDx = newAnchorX - selectedShape.x;
                        const lineDy = newAnchorY - selectedShape.y;
                        selectedShape.x += lineDx;
                        selectedShape.y += lineDy;
                        selectedShape.endX += lineDx;
                        selectedShape.endY += lineDy;
                        break;
                    case 'pencil':
                        const pencilDx = newAnchorX - selectedShape.points[0].x;
                        const pencilDy = newAnchorY - selectedShape.points[0].y;
                        selectedShape.points.forEach(point => {
                            point.x += pencilDx;
                            point.y += pencilDy;
                        });
                        break;
                    case 'text':
                        selectedShape.x = newAnchorX;
                        selectedShape.y = newAnchorY;
                        break;
                }

                this.clearCanvas();
            }
            break; 

        case 'eraser':
            const eraserMousePos = this.getMousePos(e);
            const eraserWorldPos = this.screenToWorld(eraserMousePos.x, eraserMousePos.y);
            for (let i = this.existingShapes.length - 1; i >= 0; i--) {
                const shape = this.existingShapes[i];
                if (this.isPointInShape(eraserWorldPos, shape)) {
                    this.existingShapes.splice(i, 1);
                    this.socket.send(JSON.stringify({
                        type: "delete_shape",
                        payload: { id: shape.id, roomId: this.roomId }
                    }));
                    this.clearCanvas();
                    break;
                }
            }
            break; 

        default:
            const screenPos = this.getMousePos(e);
            const worldPos = this.screenToWorld(screenPos.x, screenPos.y);
            this.clearCanvas();
            this.ctx.save();
            this.ctx.translate(this.panOffset.x, this.panOffset.y);
            this.ctx.scale(this.zoom, this.zoom);

            const selectedTool = this.selectedTool; 
            const width = worldPos.x - this.startX;
            const height = worldPos.y - this.startY;

            if (selectedTool === "rect") {
                this.ctx.strokeStyle ="white"
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                const radius = (Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2);
                const centerX = (this.startX + worldPos.x) / 2;
                const centerY = (this.startY + worldPos.y) / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, 2 * Math.PI);
                this.ctx.strokeStyle ="white"
                this.ctx.stroke();
            } else if (selectedTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(worldPos.x, worldPos.y);
                this.ctx.strokeStyle ="white"
                this.ctx.stroke();
            } else if (selectedTool === "pencil") {
                this.currentPath.push({ x: worldPos.x, y: worldPos.y });
                if (this.currentPath.length > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
                    for (let i = 1; i < this.currentPath.length; i++) {
                        this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
                    }
                    this.ctx.strokeStyle ="white"
                    this.ctx.stroke();
                }
            }else if (selectedTool === "text" && this.clicked) {
                const pos = this.getMousePos(e);
                const worldPos = this.screenToWorld(pos.x, pos.y);
                this.ctx.fillStyle = "white";
                this.ctx.font = "20px Arial";
                this.ctx.fillText("Text", worldPos.x, worldPos.y); 
            }
            this.ctx.restore();
            break; 
    }
}


    initMouseHandlers(){
        this.canvas.addEventListener("mousedown",this.mouseDownHandler)

        this.canvas.addEventListener("mouseup",this.mouseUpHandler)

        this.canvas.addEventListener("mousemove",this.mouseMoveHandler)

        this.canvas.addEventListener("wheel", this.handleWheel);
    }
}
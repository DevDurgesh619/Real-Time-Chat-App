import { getExistingShapes } from "./getShape";
type Tool = "circle" | "rect" | "line" | "pencil";
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
    }
    |{
        type:"line";
        x:number;
        y:number;
        endX:number;
        endY:number
    }
    |{
        type:"pencil";
        points:{x:number,y:number} [];
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
    private getMousePos = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };


    constructor(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket){
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")!;
        this.existingShapes= [];
        this.roomId = roomId;
        this.socket= socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.clearCanvas();
        this.initMouseHandlers();
    }
    destroy(){
        this.canvas.removeEventListener("mousedown",this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup",this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove",this.mouseMoveHandler)
    }

    setTool(tool:"circle" | "rect" | "line" | "pencil"){
        this.selectedTool = tool;
    }
    async init(){
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }
    initHandlers(){
        this.socket.onmessage =(event)=>{
            const message = JSON.parse(event.data);
            if(message.type === "chat"){
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        }
    }
    clearCanvas(){
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      this.ctx.fillStyle="rgba(0,0,0)"
        this.existingShapes.map((shape)=>{
            if(shape.type==="rect"){
              this.ctx.strokeStyle="rgba(255,255,255)"
              this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
            }else if(shape.type==="circle"){
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX,shape.centerY,Math.abs(shape.radius),0, 2 * Math.PI);
                this.ctx.strokeStyle = "white"; 
                this.ctx.stroke();
                this.ctx.closePath(); 
            }else if(shape.type==="line"){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x,shape.y);
                this.ctx.lineTo(shape.endX,shape.endY);
                this.ctx.strokeStyle = "white";  
                this.ctx.stroke();
                this.ctx.closePath(); 
            }else if (shape.type === "pencil") {
                if (shape.points.length > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    this.ctx.strokeStyle = "white";
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        })
    }
    mouseDownHandler = (e:MouseEvent) => {
        this.clicked = true
        const pos = this.getMousePos(e);
        this.startX = pos.x;
        this.startY= pos.y;
        if (this.selectedTool === "pencil") {
            this.currentPath = [{ x: pos.x, y: pos.y }];
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
        }
    }
    mouseUpHandler = (e:MouseEvent) => {
        this.clicked = false
        const pos = this.getMousePos(e);
        const width = pos.x - this.startX;
        const height = pos.y- this.startY
        let shape :Shape | null = null;
        //@ts-ignore
        const selectedTool = this.selectedTool
        if(selectedTool ==="rect"){
            shape = {
            type:"rect",
            x:this.startX,
            y:this.startY,
            width,
            height
            } 
        }else if(selectedTool==="circle"){
            const radius = (Math.sqrt(Math.pow(width,2)+Math.pow(height,2))/2);
            shape = {
            type:"circle",
            centerX:(this.startX + pos.x)/2,
            centerY:(this.startY +pos.y)/2,
            radius
            } 
        }else if(selectedTool==="line"){
            shape = {
            type:"line",
            x:this.startX,
            y:this.startY,
            endX:pos.x,
            endY:pos.y
            } 
        }else if(selectedTool ==="pencil"){
            shape = {
            type:"pencil",
            points:this.currentPath
            } 
            this.ctx.closePath();
        }
        if(!shape) return;
        this.existingShapes.push(shape)
        this.socket.send(JSON.stringify({
            type:"chat",
            message: JSON.stringify({
                shape
            }),
            roomId:this.roomId
        }))
    }
    mouseMoveHandler = (e:MouseEvent) => {
        if(this.clicked){
            const pos = this.getMousePos(e);
            const width = pos.x - this.startX;
            const height = pos.y- this.startY;
            //@ts-ignore
            const selectedTool = this.selectedTool
             if (selectedTool !== "pencil") {
                this.clearCanvas();
                this.ctx.strokeStyle = "rgba(255,255,255)";
            }
            if(selectedTool==="rect"){
                this.ctx.strokeRect(this.startX,this.startY,width,height);
            } else if(selectedTool==="circle"){
                const radius = (Math.sqrt(Math.pow(width,2)+Math.pow(height,2))/2);
                const centerX = (this.startX + pos.x)/2 ;
                const centerY = (this.startY + pos.y)/2 ;
                this.ctx.beginPath();
                this.ctx.arc(centerX,centerY,Math.abs(radius),0, 2 * Math.PI)
                this.ctx.stroke();
                this.ctx.closePath();
                
            } else if(selectedTool==="line"){
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX,this.startY);
                this.ctx.lineTo(pos.x,pos.y);
                this.ctx.strokeStyle = "white";  
                this.ctx.stroke();
                this.ctx.closePath(); 
                
            }else if (selectedTool === "pencil") {
                // add new point
                const last = this.currentPath[this.currentPath.length - 1];
                this.currentPath.push({ x: pos.x, y: pos.y });

                // just draw the new segment
                this.ctx.beginPath();
                this.ctx.moveTo(last.x, last.y);
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.strokeStyle = "white";
                this.ctx.stroke();
            }
            
        }  
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown",this.mouseDownHandler)

        this.canvas.addEventListener("mouseup",this.mouseUpHandler)

        this.canvas.addEventListener("mousemove",this.mouseMoveHandler)
    }
}
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
export class Game {
    private canvas:HTMLCanvasElement;
    private ctx :CanvasRenderingContext2D
    private existingShapes : Shape[̀]
    constructor(canvas:HTMLCanvasElement){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!;
        this.init();
    }
    init(){

    }
}
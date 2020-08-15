import { fabric } from "fabric";
import { autorun } from "mobx";
import drawingStore from "../stores/drawingStore";

export default class Drawing {
  private listeners: any;
  private canvas: fabric.Canvas;
  private line: fabric.Line | null = null;
  private isLineStraight: boolean = false;
  private width: number = 1;
  private color: string = drawingStore.color;
  public readonly OBJ_NAME: string = "drawing";

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.listeners = {
      onMouseDown: this.handleMouseDown.bind(this),
      onMouseMove: this.handleMouseMove.bind(this),
      onMouseUp: this.handleMouseUp.bind(this),
    };
  }

  public initialize(): void {
    if (!this.isLineStraight) {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.color = this.color;
    } else {
      this.canvas.defaultCursor = "crosshair";
      this.lockCanvasObjects();
      this.canvas.on({
        "mouse:down": this.listeners.onMouseDown,
      });
    }
  }

  public destroy(): void {
    this.canvas.isDrawingMode = false;
    if (this.isLineStraight) {
      this.canvas.defaultCursor = "default";
      this.unlockCanvasObjects();
      this.canvas.off({
        "mouse:down": this.listeners.onMouseDown,
      });
    }
  }

  public onAdded(obj: fabric.Object): void {
    obj.set({
      name: this.OBJ_NAME,
    });
  }

  private handleMouseDown(event: fabric.IEvent): void {
    const pointer = this.canvas.getPointer(event.e);

    this.line = new fabric.Line(
      [pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: this.color,
        strokeWidth: this.width,
        evented: false,
    });

    this.canvas.add(this.line);
    this.canvas.on({
      "mouse:move": this.listeners.onMouseMove,
      "mouse:up": this.listeners.onMouseUp,
    });
  }

  private handleMouseMove(event: fabric.IEvent): void {
    if (!this.line) {
      return;
    }
    const pointer = this.canvas.getPointer(event.e);
    this.line.set({
      x2: pointer.x,
      y2: pointer.y,
    });

    this.line.setCoords();
    this.canvas.renderAll();
  }

  private handleMouseUp(): void {
    this.line = null;
    this.canvas.off({
      "mouse:move": this.listeners.onMouseMove,
      "mouse:up": this.listeners.onMouseUp,
    });
  }

  private lockCanvasObjects(): void {
    // this.canvas.selection = false;
    this.canvas.forEachObject(obj => {
      obj.set({
        evented: false,
      });
    });
  }

  private unlockCanvasObjects(): void {
    // this.canvas.selection = true;
    this.canvas.forEachObject(obj => {
      obj.set({
        evented: true,
      });
    });
  }

  private updateColor = autorun(() => {
    const {color} = drawingStore;
    this.color = color;
    this.canvas.freeDrawingBrush.color = color;
  });

  private updateLineWidth = autorun(() => {
    const {lineWidth} = drawingStore;
    this.width = lineWidth;
    this.canvas.freeDrawingBrush.width = lineWidth;
  });

  private updateLineType = autorun(() => {
    const {isLineStraight} = drawingStore;
    this.destroy();
    this.isLineStraight = isLineStraight;
    this.initialize();
  });
}
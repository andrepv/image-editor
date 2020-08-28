import { fabric } from "fabric";
import { autorun } from "mobx";
import drawingStore from "../stores/drawingStore";
import CanvasAPI from "./CanvasAPI";
import objectManagerStore from "../stores/objectManagerStore";
import { ModeName } from "../stores/appStore";

export default class Drawing {
  private listeners: any;
  private canvas: fabric.Canvas;
  private line: fabric.Line | null = null;
  private isLineStraight: boolean = false;
  private width: number = 1;
  private color: string = drawingStore.color;
  public readonly OBJ_NAME: ModeName = "drawing";

  constructor(private canvasAPI: CanvasAPI) {
    this.canvas = canvasAPI.canvas;
    this.listeners = {
      onMouseDown: this.handleMouseDown.bind(this),
      onMouseMove: this.handleMouseMove.bind(this),
      onMouseUp: this.handleMouseUp.bind(this),
    };
    this.canvasAPI.objectManager.registerObject(this.OBJ_NAME);
  }

  public initialize(): void {
    if (!this.isLineStraight) {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.color = this.color;
    } else {
      this.canvas.defaultCursor = "crosshair";
      this.canvasAPI.objectManager.lockObjects();
      this.canvas.on({
        "mouse:down": this.listeners.onMouseDown,
      });
    }
  }

  public destroy(): void {
    this.canvas.isDrawingMode = false;
    if (this.isLineStraight) {
      this.canvas.defaultCursor = "default";
      this.canvasAPI.objectManager.unlockObjects();
      this.canvas.off({
        "mouse:down": this.listeners.onMouseDown,
      });
    }
  }

  private onAdd(obj: fabric.Object): void {
    if (obj) {
      obj.set({
        name: this.OBJ_NAME,
      });
    }
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

  private afterRemove = autorun(() => {
    const {notification} = objectManagerStore;
    if (this.canvasAPI.mode !== "drawing") {
      return;
    }
    if (notification.type === "obj_added") {
      this.onAdd(notification.data);
      objectManagerStore.resetNotification();
    }
  });
}
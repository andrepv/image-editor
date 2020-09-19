import {
  observable,
  action,
  computed,
  reaction,
  IReactionDisposer,
} from "mobx";
import { IRootStore } from "./rootStore";

import { ModeName } from "./canvasStore";
import { fabric } from "fabric";
import { ObjectManagerStore } from "./objectManagerStore";

interface IDrawingMode {
  enable: () => void;
  disable: () => void;
}

export type Reactions = {[reactionName: string]: IReactionDisposer} | null;

export class DrawingStore {
  @observable opacity: number = 1;
  @observable colorCode: string = "61, 61, 61";
  @observable lineWidth: number = 1;
  @observable isLineStraight: boolean = false;

  @computed get color() {
    return `rgba(${this.colorCode}, ${this.opacity})`;
  }

  readonly OBJ_NAME: ModeName = "drawing";
  private canvas: fabric.Canvas;
  private reactions: Reactions = null;

  private freeDrawing: IDrawingMode;
  private straightLineDrawing: IDrawingMode;
  private currentMode: IDrawingMode;

  constructor(private readonly root: IRootStore) {
    root.objectManagerStore.registerObject(this.OBJ_NAME);
    this.canvas = root.canvasStore.instance;
    this.freeDrawing = new FreeDrawing(this.canvas, this);
    this.straightLineDrawing = new StraightLineDrawing(
      this.canvas,
      root.objectManagerStore,
      this,
    );
    this.currentMode = this.freeDrawing;
  }

  @action setColorCode(colorCode: string): void {
    this.colorCode = colorCode;
  }

  @action setOpacity(value: number): void {
    this.opacity = value;
  }

  @action setLineWidth(lineWidth: number): void {
    this.lineWidth = lineWidth;
    this.canvas.freeDrawingBrush.width = lineWidth;
  }

  @action toggleFreeDrawingMode(): void {
    this.isLineStraight = !this.isLineStraight;
    this.currentMode.disable();
    this.updateMode(
      this.isLineStraight
      ? this.straightLineDrawing
      : this.freeDrawing,
    );
  }

  onSessionStart(): void {
    this.addReactions();
    this.currentMode.enable();
  }

  onSessionEnd(): void {
    this.disposeReactions();
    this.currentMode.disable();
  }

  private addReactions(): void {
    this.reactions = {
      onColorChange: reaction(
        () => this.color,
        color => this.canvas.freeDrawingBrush.color = color,
      ),

      onAdded: reaction(
        () => this.root.objectManagerStore.notification,
        notification => {
          if (notification.type === "obj_added") {
            console.log("drawing: objAdded");
            this.onAdded(notification.data);
          }
        },
      ),
    };
  }

  private disposeReactions(): void {
    for (let reactionName in this.reactions) {
      this.reactions[reactionName]();
    }
    this.reactions = null;
  }

  private updateMode(mode: IDrawingMode): void {
    this.currentMode = mode;
    this.currentMode.enable();
  }

  private onAdded(obj: fabric.Object): void {
    if (obj) {
      obj.set({
        name: this.OBJ_NAME,
      });
    }
  }
}

class FreeDrawing implements IDrawingMode {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly store: DrawingStore,
  ) {}

  enable(): void {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = this.store.color;
  }

  disable(): void {
    this.canvas.isDrawingMode = false;
  }
}


class StraightLineDrawing implements IDrawingMode {
  private line: fabric.Line | null = null;
  private listeners: any;

  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly objectManager: ObjectManagerStore,
    private readonly store: DrawingStore,
  ) {
    this.listeners = {
      onMouseDown: this.handleMouseDown.bind(this),
      onMouseMove: this.handleMouseMove.bind(this),
      onMouseUp: this.handleMouseUp.bind(this),
    };
  }

  enable(): void {
    this.canvas.defaultCursor = "crosshair";
    this.objectManager.lockObjects();
    this.canvas.on({
      "mouse:down": this.listeners.onMouseDown,
    });
  }

  disable(): void {
    this.canvas.defaultCursor = "default";
    this.objectManager.unlockObjects();
    this.canvas.off({
      "mouse:down": this.listeners.onMouseDown,
    });
  }

  private handleMouseDown(event: fabric.IEvent): void {
    const pointer = this.canvas.getPointer(event.e);

    this.line = new fabric.Line(
      [pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: this.store.color,
        strokeWidth: this.store.lineWidth,
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
}
import { action, computed } from "mobx";
import { IRootStore } from "./rootStore";
import { CanvasStore } from "./canvasStore";
import CropZone from "../canvasAPI/CropZone";

interface IEventTransform {
  corner: string,
  original: fabric.Object,
  originX: string,
  originY: string,
  width: number,
  ex: number,
  ey: number,
  target: {
    width: number,
    height: number,
    top: number,
    left: number,
  }
}

export type Ratio = {
  width: number;
  height: number;
} | null;

export class CropperStore {

  @computed get cropZoneWidth(): number {
    return this.cropZone.width;
  }

  @computed get cropZoneHeight(): number {
    return this.cropZone.height;
  }

  private readonly canvas: CanvasStore;
  private readonly cropZone: CropZone;
  private readonly listeners: any;

  constructor(private readonly root: IRootStore) {
    this.canvas = root.canvasStore;
    this.cropZone = new CropZone(root.canvasStore, root.imageStore);
    this.listeners = {
      onMouseDown: this.handleMouseDown.bind(this),
      onMouseUp: this.handleMouseUp.bind(this),
      onObjectMoving: this.handleObjectMoving.bind(this),
      onObjectScaling: this.handleObjectScaling.bind(this),
    };
  }

  @action crop(): void {
    this.cropZone.crop();
  }

  @action setRatio(ratio: Ratio): void {
    this.cropZone.setRatio(ratio);
  }

  @action setCropZoneWidth(value: number): void {
    this.cropZone.updateWidth(value);
  }

  @action setCropZoneHeight(value: number): void {
    this.cropZone.updateHeight(value);
  }

  onSessionStart(): void {
    this.addEventListeners();
    this.cropZone.create();
  }

  onSessionEnd(): void {
    this.removeEventListeners();
    this.cropZone.remove();
  }

  private addEventListeners(): void {
    const { instance: canvas } = this.canvas;
    canvas.on("mouse:down", this.listeners.onMouseDown);
    canvas.on("mouse:up", this.listeners.onMouseUp);
    canvas.on("object:moving", this.listeners.onObjectMoving);
    canvas.on("object:scaling", this.listeners.onObjectScaling);
  }

  private removeEventListeners(): void {
    const { instance: canvas } = this.canvas;
    canvas.off("mouse:down", this.listeners.onMouseDown);
    canvas.off("mouse:up", this.listeners.onMouseUp);
    canvas.off("object:moving", this.listeners.onObjectMoving);
    canvas.off("object:scaling", this.listeners.onObjectScaling);
  }

  private handleMouseDown(event: fabric.IEvent): void {
    if (event?.target?.name === "cropzone") {
      this.cropZone.toggleFocus(true);
    }
  }

  private handleMouseUp(): void {
    this.cropZone.toggleFocus(false);
  }

  private handleObjectMoving(event: fabric.IEvent): void {
    if (event?.target?.name !== "cropzone") {
      return;
    }
    const {
      startX,
      startY,
      endX,
      endY,
      startLeft,
      startTop,
    } = this.getMovingEventData(event);

    const diffX = startX - endX;
    const diffY = startY - endY;

    const endLeft = startLeft - diffX;
    const endTop = startTop - diffY;

    this.cropZone.move(endLeft, endTop);
  }

  private handleObjectScaling(event: fabric.IEvent): void {
    if (event?.target?.name !=="cropzone") {
      return;
    }
    const {
      startLeft,
      startTop,
      endLeft,
      endTop,
      endX,
      endY,
      width,
      height,
      corner,
    } = this.getScalingEventData(event);

    const resizeData: any = {
      tl: {
        width: width - (endX - startLeft),
        height: height - (endY - startTop),
        x: endX,
        y: endY,
      },
      mt: {
        width: width,
        height: height - (endY - startTop),
        x: endLeft,
        y: endY,
      },
      tr: {
        width: width + (endX - (startLeft + width)),
        height: height - (endY - startTop),
        x: endLeft,
        y: endY,
      },

      mr: {
        width: width + (endX - (startLeft + width)),
        height: height,
        x: endLeft,
        y: endTop,
      },
      br: {
        width: width + (endX - (startLeft + width)),
        height: height + (endY - (startTop + height)),
        x: endLeft,
        y: endTop,
      },

      mb: {
        width: width,
        height: height + (endY - (startTop + height)),
        x: endLeft,
        y: endTop,
      },

      bl: {
        width: width - (endX - startLeft),
        height: height + (endY - (startTop + height)),
        x: endX,
        y: endTop,
      },
      ml: {
        width: width - (endX - startLeft),
        height: height,
        x: endX,
        y: endTop,
      },
    };
    this.cropZone.resize(resizeData[corner], corner);
  }

  private getScalingEventData(event: fabric.IEvent) {
    const transform = event.transform as IEventTransform;
    const {corner, target, original} = transform;
    const {x: endX, y: endY} = this.getScalingPointer(event.pointer);
    const {
      left: startLeft,
      top: startTop,
    } = original as {left: number, top: number};
    const {width, height, left: endLeft, top: endTop} = target;
    return {
      startLeft,
      startTop,
      endLeft,
      endTop,
      endX,
      endY,
      width,
      height,
      corner,
    };
  }

  private getMovingEventData(event: fabric.IEvent) {
    const transform = event.transform as IEventTransform;
    const {ex: startX, ey: startY} = transform;
    const {x: endX, y: endY} = event.pointer as fabric.Point;
    const {
      left: startLeft,
      top: startTop,
    } = transform.original as {left: number, top: number};
    return {startX, startY, endX, endY, startLeft, startTop};
  }

  private getScalingPointer(
    pointer: fabric.Point | undefined,
  ): {x: number, y: number} {
    if (!pointer) {
      return {x: 0, y: 0};
    }
    const {size} = this.canvas;
    let {x, y} = pointer as fabric.Point;
    if (x < 0) {
      x = 0;
    }
    if (x > size.width) {
      x = size.width;
    }
    if (y < 0) {
      y = 0;
    }
    if (y > size.height) {
      y = size.height;
    }
    return {x, y};
  }
}
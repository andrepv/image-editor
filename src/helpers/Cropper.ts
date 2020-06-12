import CanvasAPI from "./CanvasAPI";
import CropZone from "./CropZone";
import { fabric } from "fabric";

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

export default class Cropper {
  private canvasAPI: CanvasAPI;
  private cropZone: CropZone;

  constructor(canvasAPI: CanvasAPI) {
    this.canvasAPI = canvasAPI;
    this.cropZone = new CropZone(canvasAPI);
  }

  public initialize(): void {
    this.addEventListeners();
    this.addOverlay();
    this.cropZone.initialize();
  }

  private addEventListeners(): void {
    const { canvas } = this.canvasAPI;
    canvas.on("mouse:down", this.handleMouseDown.bind(this));
    canvas.on("mouse:up", this.handleMouseUp.bind(this));
    canvas.on("object:moving", this.handleObjectMoving.bind(this));
    canvas.on("object:scaling", this.handleScaling.bind(this));
  }

  private handleMouseDown(event: fabric.IEvent): void {
    this.canvasAPI.canvas.selection = false;
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

  private handleScaling(event: fabric.IEvent): void {
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
    this.cropZone.resize(resizeData[corner]);
  }

  private getScalingEventData(event: fabric.IEvent) {
    const transform = event.transform as IEventTransform;
    const {x: endX, y: endY} = this.getScalingPointer(event.pointer);
    const {corner, target, original} = transform;
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
    const {canvasSize} = this.canvasAPI;
    let {x, y} = pointer as fabric.Point;
    if (x < 0) {
      x = 0;
    }
    if (x > canvasSize.width) {
      x = canvasSize.width;
    }
    if (y < 0) {
      y = 0;
    }
    if (y > canvasSize.height) {
      y = canvasSize.height;
    }
    return {x, y};
  }

  private addOverlay(): void {
    const overlay = new fabric.Rect({
      name: "overlay",
      fill: "rgba(0, 0, 0, 0.5)",
      selectable: false,
      hoverCursor: "default",
      width: this.canvasAPI.canvasSize.width,
      height: this.canvasAPI.canvasSize.height,
    });
    this.canvasAPI.canvas.add(overlay);
  }
}
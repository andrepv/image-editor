import CanvasAPI from "./CanvasAPI";
import { fabric } from "fabric";

export default class CropZone {
  private object: fabric.Object | null = null;
  private width: number = 0;
  private height: number = 0;
  private left: number = 0;
  private top: number = 0;
  private isFocused: boolean = false;
  private canvasAPI: CanvasAPI;

  private readonly MAX_WIDTH: number = 40;
  private readonly MAX_HEIGHT: number = 40;
  private readonly FRAME_WIDTH: number = 3;
  private readonly FRAME_COLOR: string = "rgba(0, 0, 0, 0.3)";
  private readonly FRAME_CORNERS_SIZE: number = 20;
  private readonly GRID_LINES_COLOR: string = "rgba(255, 255, 255, 0.6)";
  private readonly GRID_LINES_WIDTH: number = 2;

  constructor(canvasAPI: CanvasAPI) {
    this.canvasAPI = canvasAPI;
  }

  public initialize(): void {
    this.left = 0;
    this.top = 0;
    this.width = this.canvasAPI.canvasSize.width;
    this.height = this.canvasAPI.canvasSize.height;
    this.toggleFocus(true);
  }

  public toggleFocus(value: boolean): void {
    this.isFocused = value;
    this.render();
  };

  public move(left: number, top: number): void {
    this.moveLeft(left);
    this.moveTop(top);
    this.render();
  }

  public moveLeft(value: number): void {
    const { canvasSize } = this.canvasAPI;
    let left = Math.max(value, 0);
    if (value + this.width > canvasSize.width) {
      left = canvasSize.width - this.width;
    }
    this.left = left;
  }

  public moveTop(value: number): void {
    const { canvasSize } = this.canvasAPI;
    let top = Math.max(value, 0);
    if (value + this.height > canvasSize.height) {
      top = canvasSize.height - this.height;
    }
    this.top = top;
  }

  public resize(values: {
    width: number,
    height: number,
    x: number,
    y: number,
  }): void {
    const {width, height, x, y} = values;
    if (width > this.MAX_WIDTH) {
      this.left = x;
      this.width = width;
    }
    if (height > this.MAX_HEIGHT) {
      this.top = y;
      this.height = height;
    }
    this.render();
  }

  private render(): void {
    if (this.object) {
      this.canvasAPI.canvas.remove(this.object);
    }

    const image = this.drawImage();
    const grid = this.drawGrid();
    const frame = this.drawFrame();
    const group = this.isFocused ? [image, grid, frame] : [image, frame];

    this.object = new fabric.Group(group, {
      name: "cropzone",
      cornerColor: "transparent",
      hasRotatingPoint: false,
      hasBorders: false,
    });
    this.canvasAPI.canvas.add(this.object);
    this.canvasAPI.canvas.setActiveObject(this.object);
  }

  private drawImage(): fabric.Image {
    const {imageElement, canvasSize} = this.canvasAPI;
    const ratioX = imageElement.width / canvasSize.width;
    const ratioY = imageElement.height / canvasSize.height;

    const imgInstance = new fabric.Image(imageElement, {
      cropX: this.left * ratioX,
      cropY: this.top * ratioY,
      width: this.width * ratioX,
      height: this.height * ratioY,
      left: this.left,
      top: this.top,
    });
    imgInstance.scaleToWidth(Math.abs(this.width));
    imgInstance.scaleToHeight(Math.abs(this.height));
    return imgInstance;
  }

  private drawGrid(): fabric.Group {
    const lineOptions = {
      stroke: this.GRID_LINES_COLOR,
      strokeWidth: this.GRID_LINES_WIDTH,
      selectable: false,
    };
    const horizontalLines = this.drawHorizontalLines(lineOptions);
    const verticalLines = this.drawVerticalLines(lineOptions);
    return new fabric.Group([...horizontalLines, ...verticalLines]);
  }

  private drawHorizontalLines(options: fabric.ILineOptions): fabric.Object[] {
    const {left, width, height} = this;
    const lines = [];
    let top = height / 3 + this.top;

    for (let i = 0; i < 2; i++) {
      const line = new fabric.Line([left, top, left + width, top], options);
      top += height / 3;
      lines.push(line);
    }
    return lines;
  }

  private drawVerticalLines(options: fabric.ILineOptions): fabric.Object[] {
    const {top, height, width} = this;
    const lines = [];
    let left = width / 3 + this.left;

    for (let i = 0; i < 2; i++) {
      const line = new fabric.Line([left, top, left, top + height], options);
      left += width / 3;
      lines.push(line);
    }
    return lines;
  }

  private drawFrame(): fabric.Group {
    const frame = new fabric.Rect({
      width: this.width - this.FRAME_WIDTH,
      height: this.height - this.FRAME_WIDTH,
      strokeWidth: this.FRAME_WIDTH,
      stroke: this.FRAME_COLOR,
      selectable: false,
      fill: "transparent",
      left: this.left,
      top: this.top,
    });
    const corners = this.drawFrameCorners();

    return new fabric.Group([frame, ...corners]);
  }

  private drawFrameCorners(): fabric.Object[] {
    const lineOptions = {
      stroke: this.isFocused ? "blue" : "white",
      strokeWidth: this.FRAME_WIDTH,
      selectable: false,
    };

    const tlCorner = this.drawTopLeftCorner(lineOptions);
    const trCorner = this.drawTopRightCorner(lineOptions);
    const brCorner = this.drawBottomRightCorner(lineOptions);
    const blCorner = this.drawBottomLeftCorner(lineOptions);
    return [
      ...tlCorner,
      ...trCorner,
      ...brCorner,
      ...blCorner,
    ];
  }

  private drawTopLeftCorner(options: fabric.ILineOptions): fabric.Object[] {
    const {left, top, FRAME_CORNERS_SIZE: size} = this;
    return [
      new fabric.Line([left, top, left + size, top], options),
      new fabric.Line([left, top, left, top + size], options),
    ];
  }

  private drawTopRightCorner(options: fabric.ILineOptions): fabric.Object[] {
    const {top, FRAME_CORNERS_SIZE: size} = this;
    const right = this.left + this.width - this.FRAME_WIDTH;
    return [
      new fabric.Line([right - size, top, right, top], options),
      new fabric.Line([right, top, right, top + size], options),
    ];
  }

  private drawBottomRightCorner(options: fabric.ILineOptions): fabric.Object[] {
    const {FRAME_WIDTH, FRAME_CORNERS_SIZE: size} = this;
    const right = this.left + this.width - FRAME_WIDTH;
    const bottom = this.top + this.height;
    return [
      new fabric.Line([right, bottom - size, right, bottom], options),
      new fabric.Line([
        right - size,
        bottom - FRAME_WIDTH,
        right + FRAME_WIDTH,
        bottom - FRAME_WIDTH,
      ], options),
    ];
  }

  private drawBottomLeftCorner(options: fabric.ILineOptions): fabric.Object[] {
    const {left, top, FRAME_WIDTH, FRAME_CORNERS_SIZE: size} = this;
    const bottom = top + this.height;
    return [
      new fabric.Line([
        left + size,
        bottom - FRAME_WIDTH,
        left,
        bottom - FRAME_WIDTH,
      ], options),
      new fabric.Line([
        left,
        bottom - FRAME_WIDTH,
        left,
        bottom - size,
      ], options),
    ];
  }
}
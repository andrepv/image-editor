import CanvasAPI from "./CanvasAPI";
import { fabric } from "fabric";
import cropperStore, { Ratio } from "../stores/cropperStore";
import { autorun } from "mobx";

type ResizeInfo = {
  width: number,
  height: number,
  x: number,
  y: number,
}

export default class CropZone {
  private width: number = 0;
  private height: number = 0;
  private left: number = 0;
  private top: number = 0;
  private isFocused: boolean = false;
  private object: fabric.Object | null = null;
  private aspectRatio: Ratio = cropperStore.ratio;
  private readonly canvasAPI: CanvasAPI;

  private readonly FRAME_WIDTH: number = 3;
  private readonly FRAME_CORNERS_SIZE: number = 20;

  constructor(canvasAPI: CanvasAPI) {
    this.canvasAPI = canvasAPI;
  }

  public initialize(): void {
    const {width, height} = this.canvasAPI.canvasSize;
    this.setInitialSize();
    this.setLeft(width / 2 - this.width / 2);
    this.setTop(height / 2 - this.height / 2);
    // cropperStore.setCanvasSize(width, height);
    // this.setWidth(Math.min(width, height));
    // this.setHeight(Math.min(width, height));
    this.toggleFocus(true);
  }

  private setInitialSize(): void {
    const {canvasSize} = this.canvasAPI;
    let width = canvasSize.width;
    let height = canvasSize.height;
    if (this.aspectRatio) {
      const size = this.convertAspectRatioToActualSize(
        canvasSize.width,
        canvasSize.height,
      );
      if (size) {
        width = size.width;
        height = size.height;
      }
    }
    this.setWidth(width);
    this.setHeight(height);
  }

  private convertAspectRatioToActualSize(
    containerWidth: number,
    containerHeight: number,
  ): Ratio {
    if (!this.aspectRatio) {
      return null;
    }
    const height = Math.min(
      this.aspectRatio.height * containerWidth / this.aspectRatio.width,
      containerHeight,
    );
    const width = Math.min(
      this.aspectRatio.width / this.aspectRatio.height * containerHeight,
      containerWidth,
    );
    return {width, height};
  }

  public destroy(): void {
    if (this.object) {
      this.canvasAPI.canvas.remove(this.object);
      this.object = null;
    }
  }

  public toggleFocus(value: boolean): void {
    this.isFocused = value;
    this.render();
  }

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
    this.setLeft(left);
  }

  public moveTop(value: number): void {
    const { canvasSize } = this.canvasAPI;
    let top = Math.max(value, 0);
    if (value + this.height > canvasSize.height) {
      top = canvasSize.height - this.height;
    }
    this.setTop(top);
  }

  private getMinSize(): {minWidth: number, minHeight: number} {
    let minWidth = 40;
    let minHeight = 40;
    if (this.aspectRatio) {
      const minSize = this.convertAspectRatioToActualSize(
        minWidth,
        minHeight,
      );
      if (minSize) {
        minWidth = minSize.width;
        minHeight = minSize.height;
      }
    }
    return {minWidth, minHeight};
  }

  public resize(resizeInfo: ResizeInfo, corner: string): void {
    const adjustedResizeInfo = this.adjustResizeInfoWithAspectRatio(
      resizeInfo,
      corner,
    );
    const {x, y, width, height} = this.adjustResizeInfoWithMinValues(
      adjustedResizeInfo,
      corner,
    );

    this.setWidth(width);
    this.setHeight(height);
    this.setTop(y);
    this.setLeft(x);

    this.render();
  }

  private adjustResizeInfoWithAspectRatio(
    resizeInfo: ResizeInfo,
    corner: string,
  ): ResizeInfo {
    if (!this.aspectRatio) {
      return resizeInfo;
    }
    let {width, height, x, y} = resizeInfo;
    const {canvasSize} = this.canvasAPI;
    const aspectRatioValue = this.aspectRatio.width / this.aspectRatio.height;

    if (corner !== "mt" && corner !== "mb") {
      height = width / aspectRatioValue;
    }
    if (corner === "mt" || corner === "mb") {
      width = aspectRatioValue * height;
    }
    if (corner === "tl" || corner === "tr") {
      y = this.top + (this.height - height);
    }
    if (corner === "br" || corner === "bl") {
      y = this.top;
    }

    if (x + width > canvasSize.width) {
      width = width - (x + width - canvasSize.width);
      height = width / aspectRatioValue;
      x = canvasSize.width - width;
      if (corner === "mt") {
        y = this.top + (this.height - height);
      }
    }
    if (y < 0) {
      height = height + y;
      width = aspectRatioValue * height;
      y = 0;
      if (corner === "tl") {
        x = this.left + (this.width - width);
      }
    }
    if (y + height > canvasSize.height) {
      height = height - (y + height - canvasSize.height);
      width = aspectRatioValue * height;
      y = canvasSize.height - height;
      if (corner === "bl" || corner === "ml") {
        x = this.left + (this.width - width);
      }
    }
    return {width, height, x, y};
  }

  private adjustResizeInfoWithMinValues(
    values: ResizeInfo,
    corner: string,
  ): ResizeInfo {
    const {minWidth, minHeight} = this.getMinSize();
    let x = values.x;
    let y = values.y;
    const width = Math.max(values.width, minWidth);
    const height = Math.max(values.height, minHeight);
    if (values.width < minWidth) {
      x = this.left;
      if (corner === "ml" || corner === "tl" || corner === "bl") {
        x = this.left + (this.width - width);
      }
    }
    if (values.height < minHeight) {
      y = this.top;
      if (corner === "mt" || corner === "tr" || corner === "tl") {
        y = this.top + (this.height - height);
      }
    }
    return {x, y, width, height};
  }

  private setWidth(value: number): void {
    this.width = value;
    cropperStore.changeCropZoneWidth(value);
  }

  private setHeight(value: number): void {
    this.height = value;
    cropperStore.changeCropZoneHeight(value);
  }

  private setLeft(value: number): void {
    this.left = value;
    // cropperStore.left = value;
  }

  private setTop(value: number): void {
    this.top = value;
    // cropperStore.top = value;
  }

  // private updateWidth = autorun(() => {
  //   if (this.width !== cropperStore.cropZoneWidth) {
  //     this.width = cropperStore.cropZoneWidth;
  //     this.render();
  //   }
  // });

  // private updateHeight = autorun(() => {
  //   if (this.height !== cropperStore.cropZoneHeight) {
  //     this.height = cropperStore.cropZoneHeight;
  //     this.render();
  //   }
  // });

  private updateRatio = autorun(() => {
    this.aspectRatio = cropperStore.ratio;
    this.initialize();
  });

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
      stroke: "rgba(255, 255, 255, 0.6)",
      strokeWidth: 2,
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
      stroke: "rgba(0, 0, 0, 0.3)",
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
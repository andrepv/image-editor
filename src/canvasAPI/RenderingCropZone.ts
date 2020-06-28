import { fabric } from "fabric";
import CropZone from "./CropZone";
import CanvasAPI from "./CanvasAPI";

export default class RenderingCropZone {
  private innerRect: fabric.Group | null = null;
  private outerRect: fabric.Path | null = null;
  private readonly cropZone: CropZone;
  private readonly canvasAPI: CanvasAPI;

  private readonly FRAME_WIDTH: number = 3;
  private readonly FRAME_CORNERS_SIZE: number = 20;

  constructor(cropZone: CropZone, canvasAPI: CanvasAPI) {
    this.cropZone = cropZone;
    this.canvasAPI = canvasAPI;
  }

  public render(): void {
    if (this.innerRect) {
      this.canvasAPI.canvas.remove(this.innerRect);
    }
    this.innerRect = this.renderInnerRect();

    this.canvasAPI.canvas.add(this.innerRect);
    this.canvasAPI.canvas.setActiveObject(this.innerRect);
    this.renderOuterRect();
  }

  public removeAll(): void {
    if (this.innerRect) {
      this.canvasAPI.canvas.remove(this.innerRect);
      this.innerRect = null;
    }
    if (this.outerRect) {
      this.canvasAPI.canvas.remove(this.outerRect);
      this.outerRect = null;
    }
  }

  private renderInnerRect(): fabric.Group {
    const grid = this.renderGrid();
    const frame = this.renderFrame();
    const group = this.cropZone.isFocused ? [grid, frame] : [frame];

    return new fabric.Group(group, {
      name: "cropzone",
      cornerColor: "transparent",
      hasRotatingPoint: false,
      hasBorders: false,
    });
  }

  private renderOuterRect(): void {
    if (this.outerRect) {
      this.canvasAPI.canvas.remove(this.outerRect);
    }
    const {canvasSize} = this.canvasAPI;
    const {left, top, width, height} = this.cropZone;
    const right = left + width;
    const bottom = top + height;

    const leftRect = `
      M 0 0
      L ${left} 0
      L ${left} ${canvasSize.height}
      L 0 ${canvasSize.height}
    `;

    const topRect = `
      M 0 0 
      L ${canvasSize.width} 0
      L ${canvasSize.width} ${top}
      L 0 ${top}
    `;

    const bottomRect = `
      M 0 ${canvasSize.height}
      L 0 ${bottom}
      L ${canvasSize.width} ${bottom}
      L ${canvasSize.width} ${canvasSize.height}
    `;

    const rightRect = `
      M ${right} ${top}
      L ${canvasSize.width} ${top}
      L ${canvasSize.width} ${bottom}
      L ${right} ${bottom}
    `;

    this.outerRect = new fabric.Path(`
      ${topRect} ${leftRect} ${bottomRect} ${rightRect}
    `, {
      fill: "rgba(0, 0, 0, 0.5)",
      selectable: false,
      hoverCursor: "default",
    });
    this.canvasAPI.canvas.add(this.outerRect);
  }

  private renderGrid(): fabric.Group {
    const lineOptions = {
      stroke: "rgba(255, 255, 255, 0.6)",
      strokeWidth: 2,
      selectable: false,
    };
    const horizontalLines = this.renderHorizontalLines(lineOptions);
    const verticalLines = this.renderVerticalLines(lineOptions);
    return new fabric.Group([...horizontalLines, ...verticalLines]);
  }

  private renderHorizontalLines(options: fabric.ILineOptions): fabric.Object[] {
    const lines = [];
    let {top, left, width, height} = this.cropZone;
    top = height / 3 + top;

    for (let i = 0; i < 2; i++) {
      const line = new fabric.Line([left, top, left + width, top], options);
      top += height / 3;
      lines.push(line);
    }
    return lines;
  }

  private renderVerticalLines(options: fabric.ILineOptions): fabric.Object[] {
    const lines = [];
    let {top, left, height, width} = this.cropZone;
    left = width / 3 + left;

    for (let i = 0; i < 2; i++) {
      const line = new fabric.Line([left, top, left, top + height], options);
      left += width / 3;
      lines.push(line);
    }
    return lines;
  }

  private renderFrame(): fabric.Group {
    const {left, top, width, height} = this.cropZone;
    const frame = new fabric.Rect({
      width: width - this.FRAME_WIDTH,
      height: height - this.FRAME_WIDTH,
      strokeWidth: this.FRAME_WIDTH,
      stroke: "rgba(0, 0, 0, 0.3)",
      selectable: false,
      fill: "transparent",
      left,
      top,
    });
    const corners = this.drawFrameCorners();

    return new fabric.Group([frame, ...corners]);
  }

  private drawFrameCorners(): fabric.Object[] {
    const lineOptions = {
      stroke: this.cropZone.isFocused ? "blue" : "white",
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
    const {left, top} = this.cropZone;
    const size = this.FRAME_CORNERS_SIZE;
    return [
      new fabric.Line([left, top, left + size, top], options),
      new fabric.Line([left, top, left, top + size], options),
    ];
  }

  private drawTopRightCorner(options: fabric.ILineOptions): fabric.Object[] {
    const {top, left, width} = this.cropZone;
    const size = this.FRAME_CORNERS_SIZE;
    const right = left + width - this.FRAME_WIDTH;
    return [
      new fabric.Line([right - size, top, right, top], options),
      new fabric.Line([right, top, right, top + size], options),
    ];
  }

  private drawBottomRightCorner(options: fabric.ILineOptions): fabric.Object[] {
    const {top, left, width, height} = this.cropZone;
    const {FRAME_WIDTH, FRAME_CORNERS_SIZE: size} = this;
    const right = left + width - FRAME_WIDTH;
    const bottom = top + height;
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
    const {top, left, height} = this.cropZone;
    const size = this.FRAME_CORNERS_SIZE;
    const bottom = top + height;
    return [
      new fabric.Line([
        left + size,
        bottom - this.FRAME_WIDTH,
        left,
        bottom - this.FRAME_WIDTH,
      ], options),
      new fabric.Line([
        left,
        bottom - this.FRAME_WIDTH,
        left,
        bottom - size,
      ], options),
    ];
  }
}
import { fabric } from "fabric";
import Cropper from "./Cropper";

type CanvasSize = {
  width: number;
  height: number;
}

export default class CanvasAPI {
  public canvas: fabric.Canvas;
  public imageElement: HTMLImageElement;
  public canvasSize: CanvasSize = {width: 0, height: 0};
  private cropper: Cropper;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.imageElement = new Image();
    this.cropper = new Cropper(this);
  }

  public renderImage(imageUrl: string, scale: number): void {
    this.imageElement.src = imageUrl;
    this.imageElement.addEventListener("load", () => {
      const { width, height } = this.getImageSize(scale);
      this.setCanvasSize(width, height);

      this.canvas.clear();
      const imgInstance = new fabric.Image(this.imageElement, {
        selectable: false,
        hoverCursor: "default",
      });
      imgInstance.scaleToWidth(width);
      imgInstance.scaleToHeight(height);
      this.canvas.add(imgInstance);

      this.cropper.initialize();
    });
  }

  private getImageSize(scale: number): {
    width: number;
    height: number;
  } {
    const containerHeight = 0.85 * window.innerHeight * scale;
    const ratio = this.imageElement.width / this.imageElement.height;
    const height = Math.min(containerHeight / ratio, containerHeight);
    const width = ratio * height;
    return { width, height };
  }

  private setCanvasSize(width: number, height: number): void {
    this.canvasSize = {width, height};
    this.canvas.setHeight(height);
    this.canvas.setWidth(width);
  }
}
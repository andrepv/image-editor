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
  private currentMode: string = "";

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.imageElement = new Image();
    this.cropper = new Cropper(this);
  }

  public renderImage(imageUrl: string, scale: number, mode: string): void {
    if (!imageUrl) {
      return;
    }
    this.imageElement.src = imageUrl;
    fabric.Image.fromURL(imageUrl, () => {
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

      if (!mode && this.currentMode) {
        this.destroyCurrentMode();
        return;
      }

      if (mode) {
        this.initializeMode(mode);
      }
    });
  }

  private destroyCurrentMode(): void {
    if (this.currentMode === "crop") {
      this.currentMode = "";
      this.cropper.destroy();
    }
  }

  private initializeMode(mode: string): void {
    if (mode === "crop") {
      this.cropper.initialize();
      this.currentMode = mode;
    }
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
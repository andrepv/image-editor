import { fabric } from "fabric";
import { autorun } from "mobx";
import Cropper from "./Cropper";
import canvasStore from "../stores/canvasStore";
import toolbarStore from "../stores/toolbarStore";
import imageStore from "../stores/imageStore";
import CanvasImage from "./Image";

type CanvasSize = {
  width: number;
  height: number;
}

export default class CanvasAPI {
  public canvas: fabric.Canvas;
  public image: CanvasImage;
  public cropper: Cropper;
  public canvasSize: CanvasSize = {width: 0, height: 0};
  private mode: string = "";

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.cropper = new Cropper(this);
    this.image = new CanvasImage(this);
    this.addEventListeners();
  }

  public setCanvasSize(width: number, height: number): void {
    this.canvasSize = {width, height};
    this.canvas.setHeight(height);
    this.canvas.setWidth(width);
  }

  public crop(url: string): void {
    canvasStore.setMode("");
    imageStore.setUrl(url);
    toolbarStore.close();
  }

  private addEventListeners(): void {
    const canvas = (this.canvas as any).upperCanvasEl;
    canvas.addEventListener("wheel", this.onMouseWheel.bind(this));
  }

  private onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    if (!this.image.url || this.mode) {
      return;
    }
    if (event.deltaY > 0) {
      imageStore.increaseScale();
    } else {
      imageStore.decreaseScale();
    }
  }

  private destroyCurrentMode(): void {
    if (this.mode === "crop") {
      this.cropper.destroy();
    }
    this.mode = "";
  }

  private setMode(): void {
    if (this.mode === "crop") {
      this.cropper.initialize();
    }
  }

  private updateMode = autorun(() => {
    this.destroyCurrentMode();
    if (!canvasStore.mode) {
      return;
    }
    this.mode = canvasStore.mode;
    this.setMode();
  });
}
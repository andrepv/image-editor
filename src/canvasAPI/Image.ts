import { autorun } from "mobx";
import { fabric } from "fabric";
import imageStore from "../stores/imageStore";
import CanvasAPI from "./CanvasAPI";

export default class CanvasImage {
  public originalImage: HTMLImageElement;
  public flipX: boolean = false;
  public flipY: boolean = false;
  public angle: number = 0;
  public url: string = "";
  private image: fabric.Image | null = null;
  private scale: number = 1;
  private width: number = 0;
  private height: number = 0;
  private readonly canvasAPI: CanvasAPI;

  constructor(canvasAPI: CanvasAPI) {
    this.originalImage = new Image();
    this.originalImage.setAttribute("crossorigin", "anonymous");
    this.canvasAPI = canvasAPI;
  }

  public render() {
    if (!this.url) {
      return;
    }
    this.originalImage.src = this.url;
    fabric.Image.fromURL(this.url, this.onLoad.bind(this));
  }

  private onLoad(): void {
    this.canvasAPI.canvas.clear();
    this.setSize();
    this.addImage();
  }

  private addImage(): void {
    this.image = this.createImage();
    this.canvasAPI.canvas.add(this.image);
  }

  private createImage(): fabric.Image {
    const image = new fabric.Image(this.originalImage, {
      selectable: false,
      hoverCursor: "default",
      crossOrigin: "anonymous",
      flipX: this.flipX,
      flipY: this.flipY,
    });
    image.scaleToWidth(this.width);
    image.scaleToHeight(this.height);
    return image;
  }

  private setSize(): void {
    const { width, height } = this.getSize();
    this.width = width;
    this.height = height;
    this.canvasAPI.setCanvasSize(this.width, this.height);
  }

  private getSize(): {width: number; height: number} {
    const {
      width: originalWidth,
      height: originalHeight,
    } = this.getOriginalSize();

    const containerHeight = 0.85 * window.innerHeight * this.scale;
    const ratio = originalWidth / originalHeight;
    const height = Math.min(containerHeight / ratio, containerHeight);
    const width = ratio * height;
    return {width, height};
  }

  private rotate(): void {
    if (!this.image) {
      return;
    }
    this.setSize();
    this.image.rotate(this.angle).setCoords().center();
  }

  private getOriginalSize(): {width: number, height: number} {
    const originalImage = new fabric.Image(this.originalImage);
    originalImage.rotate(this.angle).setCoords();
    const {width, height} = originalImage.getBoundingRect();
    return {width, height};
  }

  private zoom(scale: number): void {
    this.scale = scale;
    this.setSize();

    if (this.image) {
      this.image.scaleToWidth(this.width);
      this.image.scaleToHeight(this.height);
      this.image.center();
    }
  }

  private updateFlipX = autorun(() => {
    const { flipX } = imageStore;
    this.flipX = flipX;
    if (this.image) {
      this.image.flipX = flipX;
      this.canvasAPI.canvas.renderAll();
    }
  });

  private updateFlipY = autorun(() => {
    const { flipY } = imageStore;
    this.flipY = flipY;
    if (this.image) {
      this.image.flipY = flipY;
      this.canvasAPI.canvas.renderAll();
    }
  });

  private updateAngle = autorun(() => {
    this.angle = imageStore.angle;
    this.rotate();
  });

  private updateUrl = autorun(() => {
    this.url = imageStore.url;
    this.render();
  });

  private updateScale = autorun(() => {
    const {scale} = imageStore;
    this.zoom(scale);
  });
}
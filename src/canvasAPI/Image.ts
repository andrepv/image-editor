import { autorun } from "mobx";
import { fabric } from "fabric";
import imageStore from "../stores/imageStore";
import CanvasAPI from "./CanvasAPI";
import Flip from "./Flip";

export default class CanvasImage {
  public originalImage: HTMLImageElement;
  public flipX: boolean = false;
  public flipY: boolean = false;
  public angle: number = 0;
  public url: string = "";
  public imageElement: fabric.Image | null = null;
  public width: number = 0;
  public height: number = 0;
  private scale: number = 1;
  private flip: Flip;
  private readonly canvasAPI: CanvasAPI;

  constructor(canvasAPI: CanvasAPI) {
    this.originalImage = new Image();
    this.originalImage.setAttribute("crossorigin", "anonymous");
    this.canvasAPI = canvasAPI;
    this.flip = new Flip(this, canvasAPI);
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
    this.imageElement = this.createImage();
    this.canvasAPI.canvas.add(this.imageElement);
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

  public setSize(): void {
    const { width, height } = this.getSize();
    this.width = width;
    this.height = height;
    this.canvasAPI.setCanvasSize(this.width, this.height);
  }

  private getSize(scale = this.scale): {width: number; height: number} {
    const {
      width: originalWidth,
      height: originalHeight,
    } = this.getOriginalSize();

    const containerHeight = 0.85 * window.innerHeight * scale;
    const ratio = originalWidth / originalHeight;
    const height = Math.min(containerHeight / ratio, containerHeight);
    const width = ratio * height;
    return {width, height};
  }

  private rotateEachObject(): void {
    if (!this.imageElement) {
      return;
    }
    const {x, y} = this.canvasAPI.getCanvasCenter();
    const prevCanvasCenter = new fabric.Point(x, y);
    this.setSize();

    this.canvasAPI.canvas.forEachObject(obj => {
      this.rotateObject(obj, prevCanvasCenter, imageStore.angleDiff);
    });
    this.canvasAPI.canvas.renderAll();
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
    this.canvasAPI.canvas.setZoom(scale);
  }

  public rotateObject(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    angleDiff: number,
  ): void {
    if (!obj) {
      return;
    }
    const canvasCenter = this.canvasAPI.getCanvasCenter();
    const radians = fabric.util.degreesToRadians(angleDiff);
    const diffX = prevCanvasCenter.x - canvasCenter.x;
    const diffY = prevCanvasCenter.y - canvasCenter.y;
    const objectPoint = new fabric.Point(
      obj.left as number,
      obj.top as number,
    );
    const newObjectPosition = fabric.util.rotatePoint(
      objectPoint,
      prevCanvasCenter,
      radians,
    );
    obj.set({
      left: newObjectPosition.x - diffX,
      top: newObjectPosition.y - diffY,
      angle: angleDiff + (obj.angle as number),
    });
    obj.setCoords();
  }

  private updateFlipX = autorun(() => {
    this.flipX = imageStore.flipX;
    this.flip.flipX();
  });

  private updateFlipY = autorun(() => {
    this.flipY = imageStore.flipY;
    this.flip.flipY();
  });

  private updateAngle = autorun(() => {
    this.angle = imageStore.angle;
    this.rotateEachObject();
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
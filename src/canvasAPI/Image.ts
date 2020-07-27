import { autorun } from "mobx";
import { fabric } from "fabric";
import imageStore from "../stores/imageStore";
import CanvasAPI from "./CanvasAPI";
import Flip from "./Flip";
import Filter from "./Filter";
import Rotation from "./Rotation";

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
  public flip: Flip;
  public filter: Filter;
  public rotation: Rotation;
  private readonly canvasAPI: CanvasAPI;

  constructor(canvasAPI: CanvasAPI) {
    this.originalImage = new Image();
    this.originalImage.setAttribute("crossorigin", "anonymous");
    this.canvasAPI = canvasAPI;
    this.flip = new Flip(this, canvasAPI);
    this.filter = new Filter(this, canvasAPI);
    this.rotation = new Rotation(this, canvasAPI);
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
    const image = new fabric.Image(this.originalImage);
    this.adjustImage(image);
    return image;
  }

  public adjustImage(image: fabric.Image): void {
    image.set({
      selectable: false,
      hoverCursor: "default",
      crossOrigin: "anonymous",
      flipX: this.flipX,
      flipY: this.flipY,
      name: "image",
    });
    image.scaleToWidth(this.width);
    image.scaleToHeight(this.height);
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

  private getOriginalSize(): {width: number, height: number} {
    const originalImage = new fabric.Image(this.originalImage);
    originalImage.rotate(this.angle).setCoords();
    const {width, height} = originalImage.getBoundingRect();
    return {width, height};
  }

  public zoom(scale: number): void {
    this.scale = scale;
    this.setSize();
    this.canvasAPI.canvas.setZoom(scale);
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
    this.rotation.rotateEachObject();
  });

  private updateUrl = autorun(() => {
    this.url = imageStore.url;
    this.render();
  });

  private updateScale = autorun(() => {
    const {scale} = imageStore;
    this.zoom(scale);
  });

  private updateFilter = autorun(() => {
    const {name, options} = imageStore.filter;
    if (!this.imageElement) {
      return;
    }
    if (name) {
      this.filter.addFilter({name, options});
    } else {
      this.filter.removeFilter();
    }
  });
}
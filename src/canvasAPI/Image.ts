import { autorun } from "mobx";
import { fabric } from "fabric";
import imageStore from "../stores/imageStore";
import CanvasAPI from "./CanvasAPI";
import Flip from "./Flip";
import Filter from "./Filter";
import Rotation from "./Rotation";
import Scaling from "./Scale";
import { RotationCommand } from "../command/rotation";

export default class CanvasImage {
  public imageElement: HTMLImageElement;
  public flipX: boolean = false;
  public flipY: boolean = false;
  public angle: number = 0;
  public prevAngle: number = 0;
  public url: string = "";
  public imageObject: fabric.Image | null = null;
  public width: number = 0;
  public height: number = 0;
  public flip: Flip;
  public filter: Filter;
  public rotation: Rotation;
  public scaling: Scaling;
  public readonly IMAGE_OBJ_NAME: string = "image";
  private prevBaseScale: number = 1;

  constructor(private readonly canvasAPI: CanvasAPI) {
    this.imageElement = new Image();
    this.imageElement.setAttribute("crossorigin", "anonymous");

    this.flip = new Flip(this, canvasAPI);
    this.filter = new Filter(this, canvasAPI);
    this.rotation = new Rotation(this, canvasAPI);
    this.scaling = new Scaling(this, canvasAPI);
  }

  public render() {
    if (!this.url) {
      return;
    }
    this.imageElement.src = this.url;
    this.filter.previousFilteredImage = this.url;
    fabric.Image.fromURL(this.url, this.onLoad.bind(this));
  }

  public initialize(): void {
    this.prevAngle = this.angle;
    this.prevBaseScale = imageStore.baseScale;
  }

  public destroy(): void {
    this.scaling.setBaseScale();
    if (this.prevAngle !== this.angle) {
      this.canvasAPI.history.push(
        new RotationCommand(
          this.prevAngle,
          this.angle,
          this.prevBaseScale,
          imageStore.baseScale,
        ),
      );
    }
  }

  public updateImageElement(url: string, callback?: () => void): void {
    const image = new Image();
    image.setAttribute("crossorigin", "anonymous");
    image.addEventListener("load", () => {
      this.imageElement = image;
      callback && callback();
    });
    image.src = url;
  }

  private onLoad(): void {
    this.canvasAPI.canvas.clear();
    this.setSize();
    this.addImage();
    this.scaling.setBaseScale();
  }

  private addImage(): void {
    this.imageObject = this.createImage();
    this.canvasAPI.canvas.add(this.imageObject);
    imageStore.setLoadingStatus = "success";
  }

  private createImage(): fabric.Image {
    const image = new fabric.Image(this.imageElement);
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
      name: this.IMAGE_OBJ_NAME,
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

  private getSize(
    scale = this.scaling.scale,
  ): {width: number; height: number} {
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
    const originalImage = new fabric.Image(this.imageElement);
    originalImage.rotate(this.angle).setCoords();
    const {width, height} = originalImage.getBoundingRect();
    return {width, height};
  }

  private updateFlip(callback: () => void): void {
    if (this.prevAngle !== this.angle) {
      this.canvasAPI.history.push(
        new RotationCommand(
          this.prevAngle,
          this.angle,
          this.prevBaseScale,
          this.scaling.getBaseScale(),
        ),
      );
      this.prevAngle = this.angle;
    }

    callback();

    if (this.canvasAPI.mode === "crop") {
      this.canvasAPI.updateCurrentMode();
    }
  }

  private updateFlipX = autorun(() => {
    this.flipX = imageStore.flipX;
    this.updateFlip(() => this.flip.flipX());
  });

  private updateFlipY = autorun(() => {
    this.flipY = imageStore.flipY;
    this.updateFlip(() => this.flip.flipY());
  });

  private updateAngle = autorun(() => {
    this.angle = imageStore.angle;
    this.rotation.rotateEachObject();

    if (this.canvasAPI.mode === "crop") {
      this.canvasAPI.updateCurrentMode();
    }
  });

  private updateUrl = autorun(() => {
    this.url = imageStore.url;
    this.render();
  });

  private updateScale = autorun(() => {
    const {scale} = imageStore;
    this.scaling.setZoom(scale);
  });

  private updateFilter = autorun(() => {
    const {name, options} = imageStore.filter;

    if (this.filter.currentFilterName === name) {
      this.filter.addFilter({name, options}, true);
      return;
    }

    if (!name && !this.filter.currentFilterName) {
      return;
    }

    this.filter.previousFilterName = this.filter.currentFilterName;
    this.filter.currentFilterName = name;

    if (!this.imageObject) {
      return;
    }
    if (name) {
      this.filter.addFilter({name, options});
    } else {
      this.filter.removeFilter();
    }
  });
}
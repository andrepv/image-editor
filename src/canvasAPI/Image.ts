import { autorun } from "mobx";
import { fabric } from "fabric";
import imageStore from "../stores/imageStore";
import CanvasAPI from "./CanvasAPI";
import Flip from "./Flip";
import Filter from "./Filter";
import Rotation from "./Rotation";
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
  private readonly canvasAPI: CanvasAPI;
  public readonly IMAGE_OBJ_NAME: string = "image";
  private scale: number = 1;

  constructor(canvasAPI: CanvasAPI) {
    this.imageElement = new Image();
    this.imageElement.setAttribute("crossorigin", "anonymous");
    this.canvasAPI = canvasAPI;
    this.flip = new Flip(this, canvasAPI);
    this.filter = new Filter(this, canvasAPI);
    this.rotation = new Rotation(this, canvasAPI);
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
  }

  public destroy(): void {
    if (this.prevAngle !== this.angle) {
      this.canvasAPI.executeCommand(
        new RotationCommand(
          this.prevAngle,
          this.angle,
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
  }

  private addImage(): void {
    this.imageObject = this.createImage();
    this.canvasAPI.canvas.add(this.imageObject);
    imageStore.updateImageLoadingStatus("success");
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
    const originalImage = new fabric.Image(this.imageElement);
    originalImage.rotate(this.angle).setCoords();
    const {width, height} = originalImage.getBoundingRect();
    return {width, height};
  }

  public zoom(scale: number): void {
    this.scale = scale;
    this.setSize();
    this.canvasAPI.canvas.setZoom(scale);
  }

  private updateFlip(callback: () => void): void {
    if (this.prevAngle !== this.angle) {
      this.canvasAPI.executeCommand(
        new RotationCommand(
          this.prevAngle,
          this.angle,
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
    this.zoom(scale);
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

  private removeAllObjects = autorun(() => {
    let {shouldClearCanvas} = imageStore;
    if (shouldClearCanvas) {
      this.canvasAPI.canvas.forEachObject(obj => {
        if (obj.name !== this.IMAGE_OBJ_NAME) {
          this.canvasAPI.canvas.remove(obj);
        }
      });
      shouldClearCanvas = false;
    }
  })
}
import { RootStore } from "./rootStore";
import { observable, action } from "mobx";
import { CanvasStore, ModeName } from "./canvasStore";
import { fabric } from "fabric";
import EffectsStore from "./effectsStore";

export class ImageStore {
  readonly OBJ_NAME: string = "image";

  @observable url: string = "";
  element: HTMLImageElement;
  instance: fabric.Image | null = null;
  width: number = 0;
  height: number = 0;
  readonly effects: EffectsStore;

  private originalUrl: string = "";
  private readonly canvas: CanvasStore;

  constructor(private readonly root: RootStore) {
    this.canvas = root.canvasStore;
    this.element = new Image();
    this.element.setAttribute("crossorigin", "anonymous");
    this.effects = new EffectsStore(this, root.canvasStore);
    root.canvasStore.registerSessionManager("effects", this);
  }

  @action async load(url: string): Promise<void> {
    this.originalUrl = url;
    this.canvas.history.clear();
    this.root.objectManagerStore.removeObjects();
    await this.update(url);
  }

  @action async update(url: string): Promise<void> {
    if (this.url) {
      this.canvas.resetState();
    }
    this.canvas.history.disableRecording();

    this.url = url;
    await this.render();

    this.canvas.history.enableRecording();
  }

  reset(): void {
    this.load(this.originalUrl);
  }

  onSessionStart(modeName: ModeName = ""): void {
    if (modeName === "effects") {
      this.effects.onSessionStart();
    }
  }

  onSessionEnd(modeName: ModeName = ""): void {
    if (modeName === "effects") {
      this.effects.onSessionEnd();
    }
  }

  setSize(): void {
    const { width, height } = this.getSize();
    this.width = width;
    this.height = height;
    this.canvas.setSize(this.width, this.height);
  }

  private render(): Promise<void> {
    if (!this.url) {
      return Promise.reject();
    }
    this.element.src = this.url;
    return new Promise(resolve => {
      fabric.Image.fromURL(this.url, () => {
        this.onLoad();
        resolve();
      });
    });
  }

  private onLoad(): void {
    this.canvas.instance.clear();
    this.setSize();
    this.addImage();
    this.canvas.updateBaseScale();
  }

  private addImage(): void {
    this.effects.resetAll();
    this.instance = this.createImage();
    this.canvas.instance.add(this.instance);
    this.effects.init();
  }

  private createImage(): fabric.Image {
    const image = new fabric.Image(this.element);
    this.adjustImage(image);
    return image;
  }

  private adjustImage(image: fabric.Image): void {
    image.set({
      selectable: false,
      hoverCursor: "default",
      crossOrigin: "anonymous",
      flipX: this.canvas.flipX,
      flipY: this.canvas.flipY,
      name: this.OBJ_NAME,
    });
    image.scaleToWidth(this.width);
    image.scaleToHeight(this.height);
  }

  private getSize(
    scale = this.canvas.scale,
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
    const originalImage = new fabric.Image(this.element);
    originalImage.rotate(this.canvas.angle).setCoords();
    const {width, height} = originalImage.getBoundingRect();
    return {width, height};
  }
}
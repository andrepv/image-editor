import { IRootStore } from "./rootStore";
import { observable, action, computed } from "mobx";
import { CanvasStore, ModeName } from "./canvasStore";
import { fabric } from "fabric";
import FilterStore from "./filterStore";

export class ImageStore {
  @observable url: string = "";
  element: HTMLImageElement;
  instance: fabric.Image | null = null;
  width: number = 0;
  height: number = 0;
  readonly OBJ_NAME: string = "image";
  private filters: FilterStore;
  private originalUrl: string = "";
  private readonly canvas: CanvasStore;

  @computed get filterName(): string {
    return this.filters.filter.name;
  }

  @computed get filterOptions(): any[] {
    return this.filters.filter.options;
  }

  constructor(private readonly root: IRootStore) {
    this.canvas = root.canvasStore;
    this.element = new Image();
    this.element.setAttribute("crossorigin", "anonymous");
    this.filters = new FilterStore(this, root.canvasStore);
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

  async addFilter(filterName: string): Promise<void> {
    await this.filters.add(filterName);
  }

  updateFilterOption(optionName: string, newValue: number): void {
    this.filters.updateFilterOption(optionName, newValue);
  }

  resetFilterState(): void {
    this.filters.resetFilterState();
  }

  onSessionStart(modeName: ModeName): void {
    if (modeName === "filters") {
      this.filters.initialize();
    }
  }

  onSessionEnd(modeName: ModeName): void {
    if (modeName === "filters") {
      this.filters.destroy();
    }
  }

  updateImageElement(url: string, callback = () => {}): void {
    const image = new Image();
    image.setAttribute("crossorigin", "anonymous");
    image.addEventListener("load", () => {
      this.element = image;
      callback();
    });
    image.src = url;
  }

  adjustImage(image: fabric.Image): void {
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
    this.filters.previousFilteredImage = this.url;
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
    this.instance = this.createImage();
    this.canvas.instance.add(this.instance);
  }

  private createImage(): fabric.Image {
    const image = new fabric.Image(this.element);
    this.adjustImage(image);
    return image;
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
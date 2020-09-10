import { CropperStore } from "./cropperStore"
import { CanvasStore } from "./canvasStore";
import { DrawingStore } from "./drawingStore";
import { TextStore } from "./textStore";
import { SearchStore } from "./searchStore";
import { AppStore } from "./appStore";
import { ObjectManagerStore } from "./objectManagerStore";
import { fabric } from "fabric";
import { ImageStore } from "./imageStore";

export interface IRootStore {
  cropperStore: CropperStore;
  canvasStore: CanvasStore;
  drawingStore: DrawingStore;
  textStore: TextStore;
  searchStore: SearchStore;
  appStore: AppStore;
  imageStore: ImageStore,
  objectManagerStore: ObjectManagerStore;
  addCanvasToDocument: (container: HTMLElement) => void;
}

export class RootStore implements IRootStore {
  cropperStore: CropperStore;
  canvasStore: CanvasStore;
  drawingStore: DrawingStore;
  textStore: TextStore;
  searchStore: SearchStore;
  appStore: AppStore; // UIStore
  objectManagerStore: ObjectManagerStore;
  imageStore: ImageStore;

  private canvasElement: HTMLCanvasElement;

  constructor() {
    this.canvasElement = document.createElement("canvas");
    document.body.append(this.canvasElement);
    const fabricCanvas = new fabric.Canvas(this.canvasElement);

    this.canvasStore = new CanvasStore(this, fabricCanvas);
    this.objectManagerStore = new ObjectManagerStore(this);
    this.imageStore = new ImageStore(this);
    this.cropperStore = new CropperStore(this);
    this.drawingStore = new DrawingStore(this);
    this.textStore = new TextStore(this);
    this.searchStore = new SearchStore(this);
    this.appStore = new AppStore(this);
  }

  addCanvasToDocument(container: HTMLElement): void {
    const parent = this.canvasElement.parentElement as any;
    container.append(parent);
  }
}

export default new RootStore();
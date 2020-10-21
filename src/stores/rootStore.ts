import { CropperStore } from "./cropperStore"
import { CanvasStore } from "./canvasStore";
import { DrawingStore } from "./drawingStore";
import { TextStore } from "./textStore";
import { SearchStore } from "./searchStore";
import { UIStore } from "./UIStore";
import { ObjectManagerStore } from "./objectManagerStore";
import { fabric } from "fabric";
import { ImageStore } from "./imageStore";

export class RootStore {
  cropperStore: CropperStore;
  canvasStore: CanvasStore;
  drawingStore: DrawingStore;
  textStore: TextStore;
  searchStore: SearchStore;
  UIStore: UIStore;
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
    this.UIStore = new UIStore(this);
  }

  addCanvasToDocument(container: HTMLElement): void {
    const parent = this.canvasElement.parentElement as Node;
    container.append(parent);
  }
}

export default new RootStore();
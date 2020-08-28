import { fabric } from "fabric";
import { autorun } from "mobx";
import imageStore from "../stores/imageStore";
import Cropper from "./Cropper";
import CanvasImage from "./Image";
import Drawing from "./Drawing";
import Text from "./Text";
import {history, IHistory} from "../command/commandHistory";
import appStore, { ModeName } from "../stores/appStore";
import ObjectManager, { IObjectManager } from "./ObjectManager";

type CanvasSize = {
  width: number;
  height: number;
}

export default class CanvasAPI {
  public canvas: fabric.Canvas;
  public image: CanvasImage;
  public cropper: Cropper;
  public drawing: Drawing;
  public text: Text;
  public history: IHistory = history;
  public objectManager: IObjectManager;
  public canvasSize: CanvasSize = {width: 0, height: 0};
  public mode: ModeName = "";
  private listeners: any;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.objectManager = new ObjectManager(this);
    this.cropper = new Cropper(this);
    this.image = new CanvasImage(this);
    this.drawing = new Drawing(this);
    this.text = new Text(this);

    this.listeners = {
      onMouseWheel: this.onMouseWheel.bind(this),
    };
    this.addEventListeners();
    this.canvas.selection = false;
  }

  public setCanvasSize(width: number, height: number): void {
    this.canvasSize = {width, height};
    this.canvas.setHeight(height);
    this.canvas.setWidth(width);
  }

  public getCanvasCenter(): {x: number, y: number} {
    const {width, height} = this.canvasSize;
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  private addEventListeners(): void {
    const canvas = (this.canvas as any).upperCanvasEl;
    canvas.addEventListener("wheel", this.listeners.onMouseWheel);
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

  public updateCurrentMode(): void {
    const modeName = this.mode;
    this.destroyCurrentMode();
    this.mode = modeName;
    this.initializeMode();
  }

  private destroyCurrentMode(): void {
    if (this.mode === "crop") {
      this.cropper.destroy();
    } else if (this.mode === "drawing") {
      this.drawing.destroy();
    } else if (this.mode === "text") {
      this.text.destroy();
    } else if (this.mode === "rotate") {
      this.image.destroy();
    } else if (this.mode === "filters") {
      this.image.filter.destroy();
    }
    this.mode = "";
  }

  private initializeMode(): void {
    if (this.mode === "crop") {
      this.cropper.initialize();
    } else if (this.mode === "drawing") {
      this.drawing.initialize();
    } else if (this.mode === "text") {
      this.text.initialize();
    } else if (this.mode === "rotate") {
      this.image.initialize();
    } else if (this.mode === "filters") {
      this.image.filter.initialize();
    }
  }

  private setMode = autorun(() => {
    const {mode} = appStore;
    this.destroyCurrentMode();
    if (!mode) {
      return;
    }
    this.mode = mode;
    this.initializeMode();
  });

  private setDataUrl = autorun(() => {
    let {updateDataUrl} = imageStore;
    if (updateDataUrl) {
      const prevScale = this.image.scaling.scale;
      this.image.scaling.setZoom(2);
      imageStore.setDataUrl(this.canvas.toDataURL());
      this.image.scaling.setZoom(prevScale);
    }
  });
}
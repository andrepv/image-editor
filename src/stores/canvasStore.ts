import { observable, action, reaction, computed } from "mobx";
import { History } from "../command/commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";
import { IRootStore } from "./rootStore";
import Flip from "../canvasAPI/Flip";
import Rotation from "../canvasAPI/Rotation";
import Scaling from "../canvasAPI/Scale";
import { RotationCommand } from "../command/rotation";

export type CanvasSize = {
  width: number;
  height: number;
}

export type Status = "pending" | "success";

export type ModeName = (
  "search"
  | "crop"
  | "rotate"
  | "drawing"
  | "text"
  | "effects"
  | ""
);

export class CanvasStore {
  @observable _scale: number = 1;
  @observable angle: number = 0;
  @observable flipX: boolean = false;
  @observable flipY: boolean = false;
  @observable mode: ModeName = "";
  history: History = new History();
  baseScale: number = 0;
  angleDiff: number = 0;
  instance: fabric.Canvas;
  size: CanvasSize = {width: 0, height: 0};

  private readonly zoomStep: number = 0.1;
  private readonly angleStep: number = 90;

  private flip: Flip;
  private rotation: Rotation;
  private scaling: Scaling;

  private prevMode: ModeName = "";
  private prevAngle: number = 0;
  private prevBaseScale: number = 1;
  private listeners: any;

  @computed get scale() {
    return this._scale;
  }

  set scale(value: number) {
    this._scale = Number(value.toFixed(1));
  }

  constructor(
    private readonly root: IRootStore,
    canvas: fabric.Canvas,
  ) {

    this.instance = canvas;
    this.flip = new Flip();
    this.rotation = new Rotation();
    this.scaling = new Scaling();

    this.listeners = {
      onMouseWheel: this.onMouseWheel.bind(this),
    };
    this.addEventListeners();

    this.instance.selection = false;

    reaction(
      () => this.angle,
      () => {
        this.rotation.rotateEachObject();
        if (this.mode === "crop") {
          this.updateCurrentMode();
        }
      },
    );

    reaction(
      () => this.scale,
      scale => this.scaling.setZoom(scale),
    );
  }

  @action rotateRight(): void {
    let nextAngle = this.angle + this.angleStep;
    if (nextAngle > 360) {
      nextAngle -= 360;
    }
    this.rotate(nextAngle);
  }

  @action rotateLeft(): void {
    let nextAngle = this.angle - this.angleStep;
    if (nextAngle < -360) {
      nextAngle += 360;
    }
    this.rotate(nextAngle);
  }

  @action rotate(angle: number): void {
    this.angleDiff = angle - this.angle;
    this.angle = angle;
  }

  @action setFlipX(value: boolean): void {
    if (this.flipX === value) {
      return;
    }
    this.flipX = value;
    this.updateFlip(() => this.flip.flipX());
  }

  @action setFlipY(value: boolean): void {
    if (this.flipY === value) {
      return;
    }
    this.flipY = value;
    this.updateFlip(() => this.flip.flipY());
  }

  @action increaseScale(): void {
    if (this.scale >= 2) {
      return;
    }
    this.scale += this.zoomStep;
  }

  @action decreaseScale(): void {
    if (this.scale <= 0.5) {
      return;
    }
    this.scale -= this.zoomStep;
  }

  @action setScale(value: number): void {
    this.scale = value;
  }

  @action setBaseScale(value: number): void {
    this.baseScale = value;
    this.setScale(value);
  }

  @action resetToBaseScale(): void {
    this.scale = this.baseScale;
  }

  @action setMode(modeName: ModeName) {
    this.mode = modeName === this.mode ? "" : modeName;

    if (this.mode === this.prevMode) {
      return;
    }
    this.destroyCurrentMode();
    if (this.mode) {
      this.prevMode = this.mode;
      this.initializeMode();
    }
  }

  getDataUrl(): string {
    return this.instance.toDataURL();
  }

  @disableHistoryRecording
  resetState(): void {
    this.setBaseScale(1);
    this.rotate(0);
    this.setFlipX(false);
    this.setFlipY(false);
  }

  setSize(width: number, height: number): void {
    this.size = {width, height};
    this.instance.setHeight(height);
    this.instance.setWidth(width);
  }

  getCenter(): {x: number, y: number} {
    const {width, height} = this.size;
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  handleObjectAtAngle(obj: any, handler: () => void): void {
    this.rotation.handleObjectAtAngle(obj, handler);
  }

  rotateEachObject(): void {
    this.rotation.rotateEachObject();
  }

  rotateObject(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    angleDiff: number,
  ): void {
    this.rotation.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  setZoom(scale: number): void {
    this.scaling.setZoom(scale);
  }

  updateBaseScale(): void {
    this.scaling.setBaseScale();
  }

  private updateCurrentMode(): void {
    const modeName = this.mode;
    this.destroyCurrentMode();
    this.prevMode = modeName;
    this.initializeMode();
  }

  private addEventListeners(): void {
    const canvas = (this.instance as any).upperCanvasEl;
    canvas.addEventListener("wheel", this.listeners.onMouseWheel);
  }

  private onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    if (!this.root.imageStore.url || this.mode) {
      return;
    }
    if (event.deltaY > 0) {
      this.increaseScale();
    } else {
      this.decreaseScale();
    }
  }

  private destroyCurrentMode(): void {
    if (this.prevMode === "crop") {
      this.root.cropperStore.onSessionEnd();
    } else if (this.prevMode === "drawing") {
      this.root.drawingStore.onSessionEnd();
    } else if (this.prevMode === "text") {
      this.root.textStore.onSessionEnd();
    } else if (this.prevMode === "rotate") {

      this.scaling.setBaseScale();
      if (this.prevAngle !== this.angle) {
        this.history.push(
          new RotationCommand(
            this.prevAngle,
            this.angle,
            this.prevBaseScale,
            this.baseScale,
          ),
        );
      }

    } else {
      this.root.imageStore.onSessionEnd(this.prevMode);
    }
    this.prevMode = "";
  }

  private initializeMode(): void {
    if (this.mode === "crop") {
      this.root.cropperStore.onSessionStart();
    } else if (this.mode === "drawing") {
      this.root.drawingStore.onSessionStart();
    } else if (this.mode === "text") {
      this.root.textStore.onSessionStart();
    } else if (this.mode === "rotate") {

      this.prevAngle = this.angle;
      this.prevBaseScale = this.baseScale;

    } else {
      this.root.imageStore.onSessionStart(this.mode);
    }
  }

  private updateFlip(callback: () => void): void {
    if (this.prevAngle !== this.angle) {
      this.history.push(
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

    if (this.mode === "crop") {
      this.updateCurrentMode();
    }
  }
}
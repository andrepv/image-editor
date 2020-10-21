import { observable, action, reaction } from "mobx";
import { fabric } from "fabric";
import { History } from "../command/commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";
import { RootStore } from "./rootStore";
import { RotationCommand } from "../command/rotation";
import { FlipCommand } from "../command/flip";

type CanvasSize = {width: number; height: number}

export type ModeName = (
  "search"
  | "crop"
  | "adjust"
  | "drawing"
  | "text"
  | "effects"
  | ""
);

interface SessionManager {
  onSessionStart: (modeName?: ModeName) => void;
  onSessionEnd: (modeName?: ModeName) => void;
}

export class CanvasStore {
  readonly SCALE_STEP: number = 0.1;
  readonly SCALE_MAX_VALUE: number = 2;
  readonly SCALE_MIN_VALUE: number = 0.5;
  readonly SCALE_DEFAULT_VALUE: number = 1;
  readonly ANGLE_STEP: number = 90;

  @observable scale: number = this.SCALE_DEFAULT_VALUE;
  @observable angle: number = 0;
  @observable flipX: boolean = false;
  @observable flipY: boolean = false;
  @observable mode: ModeName = "";

  readonly history: History = new History();
  baseScale: number = 0;
  angleDiff: number = 0;
  size: CanvasSize = {width: 0, height: 0};

  private readonly flip: Flip;
  private readonly rotation: Rotation;
  private readonly scaling: Scaling;

  private readonly listeners: any;
  private readonly sessionManagers: {[modeName: string]: SessionManager} = {};

  private prevMode: ModeName = "";
  private prevAngle: number = 0;
  private prevBaseScale: number = this.SCALE_DEFAULT_VALUE;

  constructor(
    private readonly root: RootStore,
    readonly instance: fabric.Canvas,
  ) {
    this.flip = new Flip(root);
    this.rotation = new Rotation(root);
    this.scaling = new Scaling(root);

    this.listeners = {
      onMouseWheel: this.onMouseWheel.bind(this),
    };
    this.addEventListeners();
    this.registerSessionManager("adjust", this);
    this.instance.selection = false;

    reaction(
      () => this.angle,
      () => {
        this.rotation.rotateEachObject();
      },
    );
  }

  @action rotate(angle: number): void {
    this.angleDiff = angle - this.angle;
    this.angle = angle;
  }

  @action setFlipX(value: boolean): void {
    if (this.flipX !== value) {
      this.flipX = value;
      this.updateFlip();
      this.flip.flipX();
    }
  }

  @action setFlipY(value: boolean): void {
    if (this.flipY !== value) {
      this.flipY = value;
      this.updateFlip();
      this.flip.flipY();
    }
  }

  @action setScale(value: number): void {
    this.scale = Number(value.toFixed(1));
    this.scaling.setZoom(this.scale);
  }

  @action setMode(modeName: ModeName) {
    this.mode = modeName === this.mode ? "" : modeName;

    if (this.mode === this.prevMode) {
      return;
    }

    this.disableSession();

    if (this.mode) {
      this.prevMode = this.mode;
      this.enableSession();
    }
  }

  increaseScale(): void {
    if (this.scale >= this.SCALE_MAX_VALUE) {
      return;
    }
    this.setScale(this.scale + this.SCALE_STEP);
  }

  decreaseScale(): void {
    if (this.scale <= this.SCALE_MIN_VALUE) {
      return;
    }
    this.setScale(this.scale - this.SCALE_STEP);
  }

  setBaseScale(value: number): void {
    this.baseScale = value;
    this.setScale(value);
  }

  resetToBaseScale(): void {
    this.setScale(this.baseScale);
  }

  rotateRight(): void {
    let angle = this.angle + this.ANGLE_STEP;
    if (angle > 360) {
      angle -= 360;
    }
    this.rotate(angle);
  }

  rotateLeft(): void {
    let angle = this.angle - this.ANGLE_STEP;
    if (angle < -360) {
      angle += 360;
    }
    this.rotate(angle);
  }

  registerSessionManager(modeName: ModeName, manager: SessionManager): void {
    this.sessionManagers[modeName] = manager;
  }

  getDataUrl(): string {
    return this.instance.toDataURL();
  }

  @disableHistoryRecording
  resetState(): void {
    this.setBaseScale(this.SCALE_DEFAULT_VALUE);
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

  onSessionStart(modeName: ModeName = ""): void {
    if (modeName === "adjust") {
      this.prevAngle = this.angle;
      this.prevBaseScale = this.baseScale;
    }
  }

  onSessionEnd(modeName: ModeName = ""): void {
    if (modeName === "adjust") {
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
    }
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

  private disableSession(): void {
    const sessionManager = this.sessionManagers[this.prevMode];
    if (sessionManager) {
      sessionManager.onSessionEnd(this.prevMode);
    }
    this.prevMode = "";
  }

  private enableSession(): void {
    const sessionManager = this.sessionManagers[this.mode];
    if (sessionManager) {
      sessionManager.onSessionStart(this.mode);
    }
  }

  private updateFlip(): void {
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
      this.prevBaseScale = this.scaling.getBaseScale();
    }
  }
}

class Scaling {
  constructor(private root: RootStore) {}

  setZoom(scale: number): void {
    this.root.imageStore.setSize();
    this.root.canvasStore.instance.setZoom(scale);
  }

  setBaseScale(): void {
    const scale = this.getBaseScale();
    this.root.canvasStore.setBaseScale(scale);
  }

  getBaseScale(): number {
    const canvasContainer = document.querySelector(".canvas");
    const containerHeight = (
      canvasContainer?.clientHeight ?? this.root.imageStore.height
    );
    const scale = Math.floor(
      containerHeight * 100 / this.root.imageStore.height,
    );
    if (scale) {
      return (scale - (scale % 10)) / 100;
    }
    return 1;
  }
}

class Rotation {
  constructor(private root: RootStore) {}

  rotateEachObject(): void {
    if (!this.root.imageStore.instance) {
      return;
    }
    const {x, y} = this.root.canvasStore.getCenter();
    const prevCanvasCenter = new fabric.Point(x, y);
    this.root.imageStore.setSize();

    this.root.canvasStore.instance.forEachObject(obj => {
      this.rotateObject(obj, prevCanvasCenter, this.root.canvasStore.angleDiff);
    });
    this.adjustEachObjectScale();
  }

  private adjustEachObjectScale(): void {
    const image = this.root.imageStore.instance;
    if (image) {
      const canvasWidth = this.root.canvasStore.instance.getWidth();
      const {width: imageWidth} = image.getBoundingRect();
      const ratio = canvasWidth / imageWidth;
      const {top: shiftY, left: shiftX} = image.getBoundingRect();

      this.root.canvasStore.instance.forEachObject(object => {
        let obj = object as any;
        if (obj) {
          obj.top -= shiftY;
          obj.left -= shiftX;
          obj.scale(obj.scaleX * ratio);
          obj.left = obj.left * ratio;
          obj.top = obj.top * ratio;
          obj.setCoords();
        }
      });
    }
  }

  rotateObject(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    angleDiff: number,
  ): void {
    if (!obj) {
      return;
    }
    const {left = 0, top = 0, angle = 0} = obj;
    const canvasCenter = this.root.canvasStore.getCenter();
    const radians = fabric.util.degreesToRadians(angleDiff);
    const diffX = prevCanvasCenter.x - canvasCenter.x;
    const diffY = prevCanvasCenter.y - canvasCenter.y;
    const objectPoint = new fabric.Point(left, top);
    const newObjectPosition = fabric.util.rotatePoint(
      objectPoint,
      prevCanvasCenter,
      radians,
    );
    obj.set({
      left: newObjectPosition.x - diffX,
      top: newObjectPosition.y - diffY,
      angle: angleDiff + angle,
    });

    obj.setCoords();
  }

  handleObjectAtAngle(obj: any, handler: () => void): void {
    const originalAngle = this.root.canvasStore.angle;
    this.rotateObjectToStartingAngle(obj);

    handler();

    const prevCanvasCenter = this.getCanvasCenter();
    const startingObjAngle = this.root.canvasStore.angle;

    this.setAngle(originalAngle);
    this.rotateObjectToOriginalAngle(
      obj,
      prevCanvasCenter,
      startingObjAngle,
    );
    obj.setCoords();
  }

  private rotateObjectToStartingAngle(obj: any): void {
    const prevCanvasCenter = this.getCanvasCenter();
    const startingAngle = this.root.canvasStore.angle - obj.angle;
    this.setAngle(startingAngle);

    const angleDiff = 0 - obj.angle;
    this.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private rotateObjectToOriginalAngle(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    startingObjAngle: number,
  ): void {
    const angleDiff = startingObjAngle + this.root.canvasStore.angle;
    this.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private getCanvasCenter(): fabric.Point {
    const {x, y} = this.root.canvasStore.getCenter();
    return new fabric.Point(x, y);
  }

  private setAngle(angle: number): void {
    this.root.canvasStore.angle = angle;
    this.root.imageStore.setSize();
  }
}

class Flip {
  constructor(private root: RootStore) {}
  private axis: "x" | "y" = "x";

  flipX(): void {
    this.axis = "x";
    this.flipEachObject();

    this.root.canvasStore.history.push(
      new FlipCommand(() => (
        this.root.canvasStore.setFlipX(!this.root.canvasStore.flipX)
      )),
    );
  }

  flipY(): void {
    this.axis = "y";
    this.flipEachObject();

    this.root.canvasStore.history.push(
      new FlipCommand(() => (
        this.root.canvasStore.setFlipY(!this.root.canvasStore.flipY)
      )),
    );
  }

  private flipEachObject(): void {
    if (this.root.imageStore) {
      this.root.canvasStore.instance.forEachObject(obj => this.flipObject(obj));
      this.root.imageStore?.instance?.center();
    }
  }

  private flipObject(obj: any): void {
    this.root.canvasStore.handleObjectAtAngle(
      obj,
      () => {
        let {width, height}= obj.getBoundingRect();

        if (this.axis === "x") {
          obj.flipX = !obj.flipX;
          obj.left = this.root.imageStore.width - width - obj.left;
        } else {
          obj.flipY = !obj.flipY;
          obj.top = this.root.imageStore.height - height - obj.top;
        }
        obj.setCoords();
      },
    );
  }
}
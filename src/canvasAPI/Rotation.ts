import { fabric } from "fabric";
import CanvasImage from "./Image";
import CanvasAPI from "./CanvasAPI";
import imageStore from "../stores/imageStore";

export default class Rotation {
  constructor(
    private image: CanvasImage,
    private canvasAPI: CanvasAPI,
  ) {}

  public rotateEachObject(): void {
    if (!this.image.imageObject) {
      return;
    }
    const {x, y} = this.canvasAPI.getCanvasCenter();
    const prevCanvasCenter = new fabric.Point(x, y);
    this.image.setSize();

    this.canvasAPI.canvas.forEachObject(obj => {
      this.rotateObject(obj, prevCanvasCenter, imageStore.angleDiff);
    });
    this.adjustEachObjectScale();
  }

  private adjustEachObjectScale(): void {
    const image = this.image.imageObject as any;
    const canvasWidth = this.canvasAPI.canvas.getWidth();
    const {width: imageWidth} = image.getBoundingRect();
    const ratio = canvasWidth / imageWidth;
    const {top: shiftY, left: shiftX} = image.getBoundingRect();

    this.canvasAPI.canvas.forEachObject(object => {
      let obj = object as any;
      obj.top -= shiftY;
      obj.left -= shiftX;
      obj.scale(obj.scaleX * ratio);
      obj.left = obj.left * ratio;
      obj.top = obj.top * ratio;
      obj.setCoords();
    });
  }

  public rotateObject(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    angleDiff: number,
  ): void {
    if (!obj) {
      return;
    }
    const canvasCenter = this.canvasAPI.getCanvasCenter();
    const radians = fabric.util.degreesToRadians(angleDiff);
    const diffX = prevCanvasCenter.x - canvasCenter.x;
    const diffY = prevCanvasCenter.y - canvasCenter.y;
    const objectPoint = new fabric.Point(
      obj.left as number,
      obj.top as number,
    );
    const newObjectPosition = fabric.util.rotatePoint(
      objectPoint,
      prevCanvasCenter,
      radians,
    );
    obj.set({
      left: newObjectPosition.x - diffX,
      top: newObjectPosition.y - diffY,
      angle: angleDiff + (obj.angle as number),
    });

    obj.setCoords();
  }

  public handleObjectAtAngle(obj: any, handler: () => void): void {
    const originalAngle = this.image.angle;
    this.rotateObjectToStartingAngle(obj);

    handler();

    const prevCanvasCenter = this.getCanvasCenter();
    const startingObjAngle = this.image.angle;

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
    const startingAngle = this.image.angle - obj.angle;
    this.setAngle(startingAngle);

    const angleDiff = 0 - obj.angle;
    this.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private rotateObjectToOriginalAngle(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    startingObjAngle: number,
  ): void {
    const angleDiff = startingObjAngle + this.image.angle;
    this.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private getCanvasCenter(): fabric.Point {
    const {x, y} = this.canvasAPI.getCanvasCenter();
    return new fabric.Point(x, y);
  }

  private setAngle(angle: number): void {
    this.image.angle = angle;
    this.image.setSize();
  }
}
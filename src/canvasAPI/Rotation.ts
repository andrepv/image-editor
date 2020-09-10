import { fabric } from "fabric";
import rootStore from "../stores/rootStore";

export default class Rotation {
  rotateEachObject(): void {
    if (!rootStore.imageStore.instance) {
      return;
    }
    const {x, y} = rootStore.canvasStore.getCenter();
    const prevCanvasCenter = new fabric.Point(x, y);
    rootStore.imageStore.setSize();

    rootStore.canvasStore.instance.forEachObject(obj => {
      this.rotateObject(obj, prevCanvasCenter, rootStore.canvasStore.angleDiff);
    });
    this.adjustEachObjectScale();
  }

  private adjustEachObjectScale(): void {
    const image = rootStore.imageStore.instance as any;
    const canvasWidth = rootStore.canvasStore.instance.getWidth();
    const {width: imageWidth} = image.getBoundingRect();
    const ratio = canvasWidth / imageWidth;
    const {top: shiftY, left: shiftX} = image.getBoundingRect();

    rootStore.canvasStore.instance.forEachObject(object => {
      let obj = object as any;
      obj.top -= shiftY;
      obj.left -= shiftX;
      obj.scale(obj.scaleX * ratio);
      obj.left = obj.left * ratio;
      obj.top = obj.top * ratio;
      obj.setCoords();
    });
  }

  rotateObject(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    angleDiff: number,
  ): void {
    if (!obj) {
      return;
    }
    const canvasCenter = rootStore.canvasStore.getCenter();
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

  handleObjectAtAngle(obj: any, handler: () => void): void {
    const originalAngle = rootStore.canvasStore.angle;
    this.rotateObjectToStartingAngle(obj);

    handler();

    const prevCanvasCenter = this.getCanvasCenter();
    const startingObjAngle = rootStore.canvasStore.angle;

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
    const startingAngle = rootStore.canvasStore.angle - obj.angle;
    this.setAngle(startingAngle);

    const angleDiff = 0 - obj.angle;
    this.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private rotateObjectToOriginalAngle(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    startingObjAngle: number,
  ): void {
    const angleDiff = startingObjAngle + rootStore.canvasStore.angle;
    this.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private getCanvasCenter(): fabric.Point {
    const {x, y} = rootStore.canvasStore.getCenter();
    return new fabric.Point(x, y);
  }

  private setAngle(angle: number): void {
    rootStore.canvasStore.angle = angle;
    rootStore.imageStore.setSize();
  }
}
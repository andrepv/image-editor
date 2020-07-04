import { fabric } from "fabric";
import CanvasImage from "./Image";
import CanvasAPI from "./CanvasAPI";

export default class Flip {
  private image: CanvasImage;
  private canvasAPI: CanvasAPI;
  private axis: "x" | "y" = "x";

  constructor(canvasImage: CanvasImage, canvasAPI: CanvasAPI) {
    this.image = canvasImage;
    this.canvasAPI = canvasAPI;
  }

  public flipX(): void {
    this.axis = "x";
    this.flipEachObject();
  }

  public flipY(): void {
    this.axis = "y";
    this.flipEachObject();
  }

  private flipEachObject(): void {
    if (!this.image) {
      return;
    }
    this.canvasAPI.canvas.forEachObject(obj => this.flipObject(obj));
    (this.image.imageElement as fabric.Image).center();
    this.canvasAPI.canvas.renderAll();
  }

  private flipObject(obj: any): void {
    const originalAngle = this.image.angle;
    this.rotateObjectToStartingAngle(obj);

    if (this.axis === "x") {
      obj.flipX = !obj.flipX;
      obj.left = this.image.width - (obj.left + obj.width);
    } else {
      obj.flipY = !obj.flipY;
      obj.top = this.image.height - (obj.top + obj.height);
    }
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
    this.image.rotateObject(obj, prevCanvasCenter, angleDiff);
  }

  private rotateObjectToOriginalAngle(
    obj: fabric.Object,
    prevCanvasCenter: fabric.Point,
    startingObjAngle: number,
  ): void {
    const angleDiff = startingObjAngle + this.image.angle;
    this.image.rotateObject(obj, prevCanvasCenter, angleDiff);
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
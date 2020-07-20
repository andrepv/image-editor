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
    this.image.handleObjectAccordingToTiltAngle(
      obj,
      () => {
        if (this.axis === "x") {
          obj.flipX = !obj.flipX;
          obj.left = this.image.width - (obj.left + obj.width);
        } else {
          obj.flipY = !obj.flipY;
          obj.top = this.image.height - (obj.top + obj.height);
        }
      },
    );
  }
}
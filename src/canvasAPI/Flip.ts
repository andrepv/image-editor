import { fabric } from "fabric";
import CanvasImage from "./Image";
import CanvasAPI from "./CanvasAPI";
import imageStore from "../stores/imageStore";
import { FlipCommand } from "../command/flip";

export default class Flip {
  private axis: "x" | "y" = "x";

  constructor(
    private image: CanvasImage,
    private canvasAPI: CanvasAPI,
  ) {}

  public flipX(): void {
    this.axis = "x";
    this.flipEachObject();

    this.canvasAPI.history.push(
      new FlipCommand(() => imageStore.setFlipX(!imageStore.flipX)),
    );
  }

  public flipY(): void {
    this.axis = "y";
    this.flipEachObject();

    this.canvasAPI.history.push(
      new FlipCommand(() => imageStore.setFlipY(!imageStore.flipY)),
    );
  }

  private flipEachObject(): void {
    if (!this.image) {
      return;
    }
    this.canvasAPI.canvas.forEachObject(obj => this.flipObject(obj));
    (this.image.imageObject as fabric.Image).center();
    imageStore.setFlippingStatus = "success";
  }

  private flipObject(obj: any): void {
    this.image.rotation.handleObjectAtAngle(
      obj,
      () => {
        let {width, height}= obj.getBoundingRect();

        if (this.axis === "x") {
          obj.flipX = !obj.flipX;
          obj.left = this.image.width - width - obj.left;
        } else {
          obj.flipY = !obj.flipY;
          obj.top = this.image.height - height - obj.top;
        }
      },
    );
  }
}
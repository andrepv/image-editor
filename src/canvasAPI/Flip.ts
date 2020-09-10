import { fabric } from "fabric";
import { FlipCommand } from "../command/flip";
import rootStore from "../stores/rootStore";

export default class Flip {
  private axis: "x" | "y" = "x";

  flipX(): void {
    this.axis = "x";
    this.flipEachObject();

    rootStore.canvasStore.history.push(
      new FlipCommand(() => (
        rootStore.canvasStore.setFlipX(!rootStore.canvasStore.flipX)
      )),
    );
  }

  flipY(): void {
    this.axis = "y";
    this.flipEachObject();

    rootStore.canvasStore.history.push(
      new FlipCommand(() => (
        rootStore.canvasStore.setFlipY(!rootStore.canvasStore.flipY)
      )),
    );
  }

  private flipEachObject(): void {
    if (!rootStore.imageStore) {
      return;
    }
    rootStore.canvasStore.instance.forEachObject(obj => this.flipObject(obj));
    (rootStore.imageStore.instance as fabric.Image).center();
  }

  private flipObject(obj: any): void {
    rootStore.canvasStore.handleObjectAtAngle(
      obj,
      () => {
        let {width, height}= obj.getBoundingRect();

        if (this.axis === "x") {
          obj.flipX = !obj.flipX;
          obj.left = rootStore.imageStore.width - width - obj.left;
        } else {
          obj.flipY = !obj.flipY;
          obj.top = rootStore.imageStore.height - height - obj.top;
        }
      },
    );
  }
}
import imageStore from "../stores/imageStore";
import {Command, CommandName} from "./commandHistory";
import {
  preventScaleReset,
  disableHistoryRecording,
} from "../helpers/decorators";

export class CropCommand implements Command {
  name: CommandName = "crop";
  private prevFlipX: boolean;
  private prevFlipY: boolean;
  private prevAngle: number;
  private prevBaseScale: number;

  constructor(
    private imageUrl: string,
    private prevImageUrl: string,
    private prevCanvasObjects: fabric.Object[],
  ) {
    this.prevFlipX = imageStore.flipX;
    this.prevFlipY = imageStore.flipY;
    this.prevAngle = imageStore.angle;
    this.prevBaseScale = imageStore.baseScale;
  }

  async execute(): Promise<void> {
    try {
      await imageStore.setUrl(this.imageUrl);
    } catch (error) {
      console.error(error);
    }
  }

  async undo(): Promise<void> {
    try {
      await imageStore.setUrl(this.prevImageUrl);
      this.addObjectsToCanvas();
      imageStore.setBaseScale(1);
      await this.restoreCanvasState();
    } catch (error) {
      console.error(error);
    }
  }

  @disableHistoryRecording
  @preventScaleReset
  private async restoreCanvasState(): Promise<void> {
    imageStore.setAngle(this.prevAngle);
    await imageStore.setFlipX(this.prevFlipX);
    await imageStore.setFlipY(this.prevFlipY);
    imageStore.setBaseScale(this.prevBaseScale);
  }

  private addObjectsToCanvas(): void {
    this.prevCanvasObjects.forEach(obj => {
      if (obj.name !== "image") {
        obj?.canvas?.add(obj);
      }
    });
  }
}
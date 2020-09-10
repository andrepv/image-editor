import {Command, CommandName} from "./commandHistory";
import {
  preventScaleReset,
  disableHistoryRecording,
} from "../helpers/decorators";
import rootStore from "../stores/rootStore";

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
    this.prevFlipX = rootStore.canvasStore.flipX;
    this.prevFlipY = rootStore.canvasStore.flipY;
    this.prevAngle = rootStore.canvasStore.angle;
    this.prevBaseScale = rootStore.canvasStore.baseScale;
  }

  async execute(): Promise<void> {
    try {
      await rootStore.imageStore.update(this.imageUrl);
    } catch (error) {
      console.error(error);
    }
  }

  async undo(): Promise<void> {
    try {
      await rootStore.imageStore.update(this.prevImageUrl);
      this.addObjectsToCanvas();
      // rootStore.canvasStore.setBaseScale(1);
      this.restoreCanvasState();
    } catch (error) {
      console.error(error);
    }
  }

  @disableHistoryRecording
  @preventScaleReset
  private restoreCanvasState(): void {
    rootStore.canvasStore.rotate(this.prevAngle);
    rootStore.canvasStore.setFlipX(this.prevFlipX);
    rootStore.canvasStore.setFlipY(this.prevFlipY);
    rootStore.canvasStore.setBaseScale(this.prevBaseScale);
  }

  private addObjectsToCanvas(): void {
    this.prevCanvasObjects.forEach(obj => {
      if (obj.name !== "image") {
        obj?.canvas?.add(obj);
      }
    });
  }
}
import imageStore from "../stores/imageStore";
import { Command, CommandName } from "./commandHistory";

export class CropCommand implements Command {
  public name: CommandName = "crop";
  private prevFlipX: boolean;
  private prevFlipY: boolean;
  private prevAngle: number;

  constructor(
    private imageUrl: string,
    private prevImageUrl: string,
    private prevCanvasObjects: fabric.Object[],
  ) {
    this.prevFlipX = imageStore.flipX;
    this.prevFlipY = imageStore.flipY;
    this.prevAngle = imageStore.angle;
  }

  public execute(): void {
    imageStore.setUrl(this.imageUrl);
  }

  public async undo(): Promise<void> {
    try {
      await imageStore.setUrl(this.prevImageUrl);
      this.addObjectsToCanvas();

      imageStore.preventAddingCommandsToHistory();
      imageStore.setAngle(this.prevAngle);
      await imageStore.setFlipX(this.prevFlipX);
      await imageStore.setFlipY(this.prevFlipY);
      imageStore.resumeAddingCommandsToHistory();
    } catch (error) {
      console.error(error);
    }
  }

  private addObjectsToCanvas(): void {
    this.prevCanvasObjects.forEach(obj => {
      if (obj.name !== "image") {
        obj?.canvas?.add(obj);
      }
    });
  }
}
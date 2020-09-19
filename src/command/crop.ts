import {Command, CommandName} from "./commandHistory";
import {
  preventScaleReset,
  disableHistoryRecording,
} from "../helpers/decorators";
import rootStore from "../stores/rootStore";
import { EffectValue } from "../stores/effectsStore";

export class CropCommand implements Command {
  name: CommandName = "crop";
  private prevFlipX: boolean;
  private prevFlipY: boolean;
  private prevAngle: number;
  private prevBaseScale: number;
  private prevEffects: EffectValue[];

  constructor(
    private imageUrl: string,
    private prevImageUrl: string,
    private prevCanvasObjects: fabric.Object[],
  ) {
    const {canvasStore: canvas, imageStore: image} = rootStore;
    this.prevFlipX = canvas.flipX;
    this.prevFlipY = canvas.flipY;
    this.prevAngle = canvas.angle;
    this.prevBaseScale = canvas.baseScale;
    this.prevEffects = image.effects.getValues();
  }

  async execute(): Promise<void> {
    try {
      const {imageStore: image} = rootStore;
      await image.update(this.imageUrl);
      image.effects.savedValues = image.effects.getValues();
    } catch (error) {
      console.error(error);
    }
  }

  async undo(): Promise<void> {
    try {
      await rootStore.imageStore.update(this.prevImageUrl);
      this.addObjectsToCanvas();
      this.restoreEffects();
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

  private restoreEffects(): void {
    const {imageStore: image} = rootStore;
    image.effects.setValues(this.prevEffects);
    image.effects.savedValues = this.prevEffects;
  }

  private addObjectsToCanvas(): void {
    this.prevCanvasObjects.forEach(obj => {
      if (obj.name !== "image") {
        obj?.canvas?.add(obj);
      }
    });
  }
}
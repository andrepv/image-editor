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
  private prevImageUrl: string;
  private prevEffects: EffectValue[];

  constructor(
    private imageUrl: string,
    private prevCanvasObjects: any[],
  ) {
    const {canvasStore: canvas, imageStore: image} = rootStore;
    this.prevImageUrl = rootStore.imageStore.element.src;
    this.prevFlipX = canvas.flipX;
    this.prevFlipY = canvas.flipY;
    this.prevAngle = canvas.angle;
    this.prevBaseScale = canvas.baseScale;
    this.prevEffects = image.effects.getValues();
  }

  async execute(): Promise<void> {
    try {
      const {imageStore: image, UIStore, canvasStore} = rootStore;
      await image.update(this.imageUrl);
      image.effects.savedValues = image.effects.getValues();
      if (UIStore.isToolbarOpen) {
        canvasStore.setScale(1);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async undo(): Promise<void> {
    await rootStore.imageStore.update(this.prevImageUrl);
    this.addObjectsToCanvas();
    this.restoreCanvasState();
    this.restoreEffects();
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
      if (obj.name !== rootStore.imageStore.OBJ_NAME) {
        rootStore.canvasStore.instance.add(obj);
      }
    });
  }
}
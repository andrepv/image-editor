import { observable, action } from "mobx";

export class ImageStore {
  @observable public url: string = "";
  @observable public scale: number = 1;
  @observable public angle: number = 0;
  @observable public flipX: boolean = false;
  @observable public flipY: boolean = false;
  public angleDiff: number = 0;
  public readonly zoomStep: number = 0.1;
  public readonly angleStep: number = 90;

  @action public setUrl(url: string): void {
    this.url = url;
    this.resetState();
  }

  @action public rotateRight(): void {
    this.angleDiff = this.angleStep;
    if (this.angle === 360) {
      this.angle = this.angleStep;
      return;
    }
    this.angle += this.angleStep;
  }

  @action public rotateLeft(): void {
    this.angleDiff = -this.angleStep;
    if (this.angle === -360) {
      this.angle = -this.angleStep;
      return;
    }
    this.angle -= this.angleStep;
  }

  @action public toggleFlipX(): void {
    this.flipX = !this.flipX;
  }

  @action public toggleFlipY(): void {
    this.flipY = !this.flipY;
  }

  @action public increaseScale(): void {
    if (this.scale >= 2) {
      return;
    }
    this.scale += this.zoomStep;
  }

  @action public decreaseScale(): void {
    if (this.scale <= 0.5) {
      return;
    }
    this.scale -= this.zoomStep;
  }

  @action public resetScale(): void {
    this.scale = 1;
  }

  private resetState(): void {
    this.scale = 1;
    this.flipX = false;
    this.flipY = false;
    this.angle = 0;
  }
}

export default new ImageStore();
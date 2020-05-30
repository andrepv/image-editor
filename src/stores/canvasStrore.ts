import { observable, action } from "mobx";

export class CanvasStore {
  @observable imageUrl: string = "";
  @observable scale: number = 1;
  canvasElement: HTMLCanvasElement | null = null;

  @action setImageUrl(url: string) {
    this.imageUrl = url;
    this.scale = 1;
  }

  @action increaseScale() {
    if (this.scale >= 2) {
      return;
    }
    this.scale += 0.1;
  }

  @action decreaseScale() {
    if (this.scale <= 0.5) {
      return;
    }
    this.scale -= 0.1;
  }

  setCanvasElement(element: HTMLCanvasElement) {
    this.canvasElement = element;
  }
}

export default new CanvasStore();
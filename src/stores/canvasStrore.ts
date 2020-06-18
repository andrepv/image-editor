import { observable, action } from "mobx";
import toolbarStore from "./toolbarStore";

export class CanvasStore {
  @observable imageUrl: string = "";
  @observable scale: number = 1;
  @observable mode: string = "";
  canvasElement: HTMLCanvasElement | null = null;

  @action
  setImageUrl(url: string) {
    this.imageUrl = url;
    this.scale = 1;
  }

  @action
  increaseScale() {
    if (this.scale >= 2) {
      return;
    }
    this.scale += 0.1;
  }

  @action
  decreaseScale() {
    if (this.scale <= 0.5) {
      return;
    }
    this.scale -= 0.1;
  }

  @action
  setMode(modeName: string) {
    this.scale = 1;
    if (modeName === this.mode) {
      this.mode = "";
      return;
    }
    this.mode = modeName;
  }

  setCanvasElement(element: HTMLCanvasElement) {
    this.canvasElement = element;
  }
}

export default new CanvasStore();
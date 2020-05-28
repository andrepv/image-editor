import { observable, action } from "mobx";

export class CanvasStore {
  @observable imageUrl: string = "";
  @observable scale: number = 1;
  canvasElement: HTMLCanvasElement | null = null;

  @action setImageUrl(url: string) {
    this.imageUrl = url;
    this.changeScale(1);
  }

  @action changeScale(value: number) {
    this.scale = Number(value.toFixed(1));
  }

  setCanvasElement(element: HTMLCanvasElement) {
    this.canvasElement = element;
  }
}

export default new CanvasStore();
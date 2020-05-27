import { observable, action } from "mobx";

export class CanvasStore {
  @observable imageUrl: string = "";
  canvasElement: HTMLCanvasElement | null = null;

  @action setImageUrl(url: string) {
    this.imageUrl = url;
  }

  setCanvasElement(element: HTMLCanvasElement) {
    this.canvasElement = element;
  }
}

export default new CanvasStore();
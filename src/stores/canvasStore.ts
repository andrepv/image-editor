import { observable, action } from "mobx";

export class CanvasStore {
  @observable public mode: string = "";
  public canvasElement: HTMLCanvasElement | null = null;

  @action public setMode(modeName: string) {
    if (modeName === this.mode) {
      this.mode = "";
      return;
    }
    this.mode = modeName;
  }

  public setCanvasElement(element: HTMLCanvasElement) {
    this.canvasElement = element;
  }
}

export default new CanvasStore();
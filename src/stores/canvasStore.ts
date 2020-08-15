import { observable, action } from "mobx";

export class CanvasStore {
  @observable public mode: string = "";
  public canvasElement: HTMLCanvasElement | null = null;
  @observable public isUndoCommandAvailable: boolean = false;
  @observable public isRedoCommandAvailable: boolean = false;

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

  @action public updateHistoryButtons(
    isUndoCommandAvailable: boolean,
    isRedoCommandAvailable: boolean,
  ): void {
    this.isUndoCommandAvailable = isUndoCommandAvailable;
    this.isRedoCommandAvailable = isRedoCommandAvailable;
  }
}

export default new CanvasStore();
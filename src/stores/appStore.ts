import { observable, action } from "mobx";

export type ModeName = (
  "search" | "crop" | "rotate" | "drawing" | "text" | "filters" | ""
);

export class AppStore {
  @observable isToolbarOpen: boolean = false;
  @observable canUndo: boolean = false;
  @observable canRedo: boolean = false;
  @observable mode: ModeName = "";
  isHistoryCommandExecuted: boolean = false;

  @action toggleToolbar(mode: ModeName): void {
    if (this.mode === mode || !this.isToolbarOpen) {
      this.isToolbarOpen = !this.isToolbarOpen;
    }
    this.setMode(mode);
  }

  @action closeToolbar(): void {
    this.isToolbarOpen = false;
    this.mode = "";
  }

  @action updateHistoryButtons(
    canUndo: boolean,
    canRedo: boolean,
  ): void {
    this.canUndo = canUndo;
    this.canRedo = canRedo;
  }

  @action setMode(modeName: ModeName) {
    if (modeName === this.mode) {
      this.mode = "";
      return;
    }
    this.mode = modeName;
  }
}

export default new AppStore();
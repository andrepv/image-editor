import { observable, action } from "mobx";
import { IRootStore } from "./rootStore";
import { ModeName } from "./canvasStore";

export class AppStore {
  @observable isToolbarOpen: boolean = false;
  @observable canUndo: boolean = false;
  @observable canRedo: boolean = false;

  constructor(private readonly root: IRootStore) {}

  @action toggleToolbar(mode: ModeName): void {
    if (this.root.canvasStore.mode === mode || !this.isToolbarOpen) {
      this.isToolbarOpen = !this.isToolbarOpen;
    }
    this.root.canvasStore.setMode(mode);
  }

  @action closeToolbar(): void {
    this.isToolbarOpen = false;
    this.root.canvasStore.setMode("");
  }

  @action updateHistoryButtons(
    canUndo: boolean,
    canRedo: boolean,
  ): void {
    this.canUndo = canUndo;
    this.canRedo = canRedo;
  }
}
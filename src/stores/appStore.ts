import { observable, action } from "mobx";

export class AppStore {
  @observable public isToolbarOpen: boolean = false;
  @observable public type: string = "";

  @action public toggleToolbar(type: string): void {
    if (this.type === type || !this.isToolbarOpen) {
      this.isToolbarOpen = !this.isToolbarOpen;
    }
    this.toggleType(type);
  }

  @action public closeToolbar(): void {
    this.isToolbarOpen = false;
    this.type = "";
  }

  public toggleType(type: string): void {
    if (this.type === type) {
      this.type = "";
      return;
    }
    this.type = type;
  }
}

const appStore = new AppStore();
export default appStore;
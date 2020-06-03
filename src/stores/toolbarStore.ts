import { observable, action } from "mobx";

export class ToolbarStore {
  @observable isOpen: boolean = false;
  @observable type: string = "";

  @action toggle(type: string) {
    if (this.type === type || !this.isOpen) {
      this.isOpen = !this.isOpen;
    }
    this.toggleType(type);
  }

  toggleType(type: string) {
    if (this.type === type) {
      this.type = "";
      return;
    }
    this.type = type;
  }
}

const toolbarStore = new ToolbarStore();
export default toolbarStore;
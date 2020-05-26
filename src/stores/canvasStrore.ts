import { observable, action } from "mobx";

export class CanvasStore {
  @observable imageUrl: string = "";

  @action setImageUrl(url: string) {
    this.imageUrl = url;
  }
}

export default new CanvasStore();
import { observable, action } from "mobx";

export type Ratio = {
  width: number;
  height: number;
} | null;

export class CropperStore {
  @observable cropZoneWidth: number = 0;
  @observable cropZoneHeight: number = 0;
  @observable ratio: Ratio = null;
  @observable ratioName: string = "custom";
  // private canvasWidth: number = 0;
  // private canvasHeight: number = 0;
  // public left: number = 0;
  // public top: number = 0;

  @action
  public setRatio(ratio: {name: string, value: Ratio}): void {
    this.ratioName = ratio.name;
    this.ratio = ratio.value;
  }

  @action
  public changeCropZoneWidth(value: number): void {
    // const width = value + this.left > this.canvasWidth
    //   ? this.canvasWidth - this.left
    //   : value;
    // this.cropZoneWidth = Math.max(width, 40);
    this.cropZoneWidth = value;
  }

  @action
  public changeCropZoneHeight(value: number): void {
    // const height = value + this.top > this.canvasHeight
    //   ? this.canvasHeight - this.top
    //   : value;
    // this.cropZoneHeight = Math.max(height, 40);
    this.cropZoneHeight = value;
  }

  // public setCanvasSize(width: number, height: number): void {
  //   this.canvasWidth = width;
  //   this.canvasHeight = height;
  // }
}

export default new CropperStore();
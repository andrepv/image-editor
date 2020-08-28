import { observable, action } from "mobx";

export type Ratio = {
  width: number;
  height: number;
} | null;

export class CropperStore {
  @observable shouldCrop: boolean = false;
  @observable cropZoneWidth: number = 0;
  @observable cropZoneHeight: number = 0;

  @observable widthIndicator: number = 0;
  @observable heightIndicator: number = 0;

  @observable ratio: Ratio = null;
  @observable ratioName: string = "custom";

  @action crop(value: boolean): void {
    this.shouldCrop = value;
  }

  @action setRatio(ratio: {name: string, value: Ratio}): void {
    this.ratioName = ratio.name;
    this.ratio = ratio.value;
  }

  @action changeCropZoneWidth(value: number): void {
    this.cropZoneWidth = value;
  }

  @action changeCropZoneHeight(value: number): void {
    this.cropZoneHeight = value;
  }

  @action setWidthIndicatorValue(value: number): void {
    this.widthIndicator = value;
  }

  @action setHeightIndicatorValue(value: number): void {
    this.heightIndicator = value;
  }
}

export default new CropperStore();
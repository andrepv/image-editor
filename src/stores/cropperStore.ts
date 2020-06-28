import { observable, action } from "mobx";

export type Ratio = {
  width: number;
  height: number;
} | null;

export class CropperStore {
  @observable public shouldCrop: boolean = false;
  @observable public cropZoneWidth: number = 0;
  @observable public cropZoneHeight: number = 0;

  @observable public widthIndicator: number = 0;
  @observable public heightIndicator: number = 0;

  @observable public ratio: Ratio = null;
  @observable public ratioName: string = "custom";

  @action public crop(value: boolean): void {
    this.shouldCrop = value;
  }

  @action public setRatio(ratio: {name: string, value: Ratio}): void {
    this.ratioName = ratio.name;
    this.ratio = ratio.value;
  }

  @action public changeCropZoneWidth(value: number): void {
    this.cropZoneWidth = value;
  }

  @action public changeCropZoneHeight(value: number): void {
    this.cropZoneHeight = value;
  }

  @action public setWidthIndicatorValue(value: number): void {
    this.widthIndicator = value;
  }

  @action public setHeightIndicatorValue(value: number): void {
    this.heightIndicator = value;
  }
}

export default new CropperStore();
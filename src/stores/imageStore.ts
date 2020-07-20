import { observable, action } from "mobx";

const defaultFilterOptions: any = {
  BoxBlur: [
    {name: "hRadius", value: 3, minValue: 1, maxValue: 20},
    {name: "vRadius", value: 3, minValue: 1, maxValue: 20},
    {name: "quality", value: 3, minValue: 1, maxValue: 10},
  ],
  StackBlur: [
    {name: "radius", value: 6, minValue: 1, maxValue: 40},
  ],
  BrightnessContrastGimp: [
    {name: "brightness", value: 0, minValue: -100, maxValue: 100},
    {name: "contrast", value: 0, minValue: -100, maxValue: 100},
  ],
  ColorTransformFilter: [
    {name: "redMultiplier", value: 1, hidden: true},
    {name: "greenMultiplier", value: 1, hidden: true},
    {name: "blueMultiplier", value: 1, hidden: true},
    {name: "alphaMultiplier", value: 1, hidden: true},
    {name: "red", value: 0, minValue: -255, maxValue: 255},
    {name: "green", value: 0, minValue: -255, maxValue: 255},
    {name: "blue", value: 0, minValue: -255, maxValue: 255},
    {name: "alphaOffset", value: 0, hidden: true},
  ],
  Dither: [
    {name: "levels", value: 8, minValue: 2, maxValue: 30},
  ],
  HSLAdjustment: [
    {name: "H", value: 0, minValue: -180, maxValue: 100},
    {name: "S", value: 0, minValue: -180, maxValue: 100},
    {name: "L", value: 0, minValue: -180, maxValue: 100},
  ],
  Mosaic: [
    {name: "blockSize", value: 10, minValue: 1, maxValue: 100},
  ],
  Oil: [
    {name: "range", value: 2, minValue: 1, maxValue: 5},
    {name: "levels", value: 32, hidden: true},
  ],
  Posterize: [
    {name: "levels", value: 8, minValue: 2, maxValue: 32},
  ],
  Sharpen: [
    {name: "factor", value: 3, minValue: 1, maxValue: 10},
  ],
};

export class ImageStore {
  @observable public url: string = "";
  @observable public scale: number = 1;
  @observable public angle: number = 0;
  @observable public flipX: boolean = false;
  @observable public flipY: boolean = false;
  @observable public filter: any = observable({
    name: "",
    options: [],
  });
  public angleDiff: number = 0;
  public readonly zoomStep: number = 0.1;
  public readonly angleStep: number = 90;

  @action public setUrl(url: string): void {
    this.url = url;
    this.resetState();
  }

  @action public rotateRight(): void {
    this.angleDiff = this.angleStep;
    if (this.angle === 360) {
      this.angle = this.angleStep;
      return;
    }
    this.angle += this.angleStep;
  }

  @action public rotateLeft(): void {
    this.angleDiff = -this.angleStep;
    if (this.angle === -360) {
      this.angle = -this.angleStep;
      return;
    }
    this.angle -= this.angleStep;
  }

  @action public toggleFlipX(): void {
    this.flipX = !this.flipX;
  }

  @action public toggleFlipY(): void {
    this.flipY = !this.flipY;
  }

  @action public increaseScale(): void {
    if (this.scale >= 2) {
      return;
    }
    this.scale += this.zoomStep;
  }

  @action public decreaseScale(): void {
    if (this.scale <= 0.5) {
      return;
    }
    this.scale -= this.zoomStep;
  }

  @action public resetScale(): void {
    this.scale = 1;
  }

  @action public addFilter(filterName: string): void {
    if (this.filter.name === filterName) {
      this.resetFilterState();
      return;
    }
    this.filter = {
      name: filterName,
      options: defaultFilterOptions[filterName] || [],
    };
  }

  @action public updateFilterOption(
    optionName: string,
    newValue: number,
  ): void {
    this.filter.options = this.filter.options.map((option: any) => {
      if (option.name === optionName) {
        return {...option, value: newValue};
      }
      return option;
    });
  }

  @action public resetFilterState(): void {
    this.filter = {
      name: "",
      options: [],
    };
  }

  private resetState(): void {
    this.scale = 1;
    this.flipX = false;
    this.flipY = false;
    this.angle = 0;
  }
}

export default new ImageStore();
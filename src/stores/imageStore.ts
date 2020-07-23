import { observable, action } from "mobx";
import defaultFilterOptions from "../helpers/defaultFilterOptions";


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
    if (url === this.url) {
      return;
    }
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
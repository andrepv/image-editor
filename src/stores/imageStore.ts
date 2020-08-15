import { observable, action, when } from "mobx";
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
  @observable public imageLoadingStatus: string = "";
  @observable public imageFilteringStatus: string = "";
  @observable public imageFlippingStatus: string = "";
  @observable public shouldClearCanvas: boolean = false;
  public shouldAddCommandsToHistory: boolean = true;
  public angleDiff: number = 0;
  public readonly zoomStep: number = 0.1;
  public readonly angleStep: number = 90;

  @action public async setUrl(url: string): Promise<void> {
    if (url === this.url) {
      return Promise.reject();
    }

    if (this.url) {
      await this.resetState();
    }

    this.preventAddingCommandsToHistory();
    this.updateImageLoadingStatus("pending");
    this.url = url;
    when(
      () => this.imageLoadingStatus === "success",
      () => this.resumeAddingCommandsToHistory(),
    );

    return when(() => this.imageLoadingStatus === "success");
  }

  @action public rotateRight(): void {
    let nextAngle = this.angle + this.angleStep;
    if (nextAngle > 360) {
      nextAngle -= 360;
    }
    this.setAngle(nextAngle);
  }

  @action public rotateLeft(): void {
    let nextAngle = this.angle - this.angleStep;
    if (nextAngle < -360) {
      nextAngle += 360;
    }
    this.setAngle(nextAngle);
  }

  @action public setAngle(angle: number): void {
    this.angleDiff = angle - this.angle;
    this.angle = angle;
  }

  @action public async setFlipX(value: boolean): Promise<void> {
    if (this.flipX === value) {
      return Promise.resolve();
    }
    this.updateImageFlippingStatus("pending");
    this.flipX = value;
    return when(() => this.imageFlippingStatus === "success");
  }

  @action public async setFlipY(value: boolean): Promise<void> {
    if (this.flipY === value) {
      return Promise.resolve();
    }
    this.updateImageFlippingStatus("pending");
    this.flipY = value;
    return when(() => this.imageFlippingStatus === "success");
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

  @action public async addFilter(filterName: string): Promise<void> {
    if (this.imageFilteringStatus === "pending") {
      return Promise.reject("filter is loading");
    }
    this.updateImageFilteringStatus("pending");
    if (this.filter.name === filterName) {
      this.resetFilterState();
    } else {
      this.filter = {
        name: filterName,
        options: defaultFilterOptions[filterName] || [],
      };
    }
    return when(() => this.imageFilteringStatus === "success");
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

  @action public updateImageLoadingStatus(status: string): void {
    this.imageLoadingStatus = status;
  }

  @action public updateImageFilteringStatus(status: string): void {
    this.imageFilteringStatus = status;
  }

  @action public updateImageFlippingStatus(status: string): void {
    this.imageFlippingStatus = status;
  }

  @action public async loadImage(url: string): Promise<void> {
    await this.setUrl(" ");
    await this.setUrl(url);
    this.resetFilterState();
    this.shouldClearCanvas = true;
  }

  public preventAddingCommandsToHistory(): void {
    this.shouldAddCommandsToHistory = false;
  }

  public resumeAddingCommandsToHistory(): void {
    this.shouldAddCommandsToHistory = true;
  }

  private async resetState(): Promise<void> {
    this.preventAddingCommandsToHistory();
    this.resetScale();
    this.setAngle(0);
    await this.setFlipX(false);
    await this.setFlipY(false);
    this.resumeAddingCommandsToHistory();
  }
}

export default new ImageStore();
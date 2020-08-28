import { observable, action, when } from "mobx";
import defaultFilterOptions from "../helpers/defaultFilterOptions";
import { history } from "../command/commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";

type Status = "pending" | "success";

export class ImageStore {
  @observable url: string = "";
  @observable scale: number = 1;
  @observable angle: number = 0;
  @observable flipX: boolean = false;
  @observable flipY: boolean = false;
  @observable filter: any = observable({
    name: "",
    options: [],
  });
  @observable clearCanvas: boolean = false;
  @observable updateDataUrl: boolean = false;

  @observable private loadingStatus: Status = "success";
  @observable private filteringStatus: Status = "success";
  @observable private flippingStatus: Status = "success";

  originalImageUrl: string = "";
  baseScale: number = 0;
  angleDiff: number = 0;
  private dataUrl: string = "";
  private readonly zoomStep: number = 0.1;
  private readonly angleStep: number = 90;

  @action async setUrl(url: string): Promise<void> {
    if (url === this.url) {
      return Promise.reject();
    }

    if (this.url) {
      await this.resetState();
    }

    history.disableRecording();
    this.setLoadingStatus = "pending";
    this.url = url;

    return new Promise(resove => {
      when(
        () => this.loadingStatus === "success",
        () => {
          history.enableRecording();
          resove();
        },
      );
    });
  }

  @action rotateRight(): void {
    let nextAngle = this.angle + this.angleStep;
    if (nextAngle > 360) {
      nextAngle -= 360;
    }
    this.setAngle(nextAngle);
  }

  @action rotateLeft(): void {
    let nextAngle = this.angle - this.angleStep;
    if (nextAngle < -360) {
      nextAngle += 360;
    }
    this.setAngle(nextAngle);
  }

  @action setAngle(angle: number): void {
    this.angleDiff = angle - this.angle;
    this.angle = angle;
  }

  @action setFlipX(value: boolean): Promise<void> {
    if (this.flipX === value) {
      return Promise.resolve();
    }
    this.setFlippingStatus = "pending";
    this.flipX = value;
    return when(() => this.flippingStatus === "success");
  }

  @action setFlipY(value: boolean): Promise<void> {
    if (this.flipY === value) {
      return Promise.resolve();
    }
    this.setFlippingStatus = "pending";
    this.flipY = value;
    return when(() => this.flippingStatus === "success");
  }

  @action increaseScale(): void {
    if (this.scale >= 2) {
      return;
    }
    this.scale += this.zoomStep;
  }

  @action decreaseScale(): void {
    if (this.scale <= 0.5) {
      return;
    }
    this.scale -= this.zoomStep;
  }

  @action setScale(value: number): void {
    this.scale = value;
  }

  @action setBaseScale(value: number): void {
    this.baseScale = value;
    this.setScale(value);
  }

  @action resetToBaseScale(): void {
    this.scale = this.baseScale;
  }

  @action addFilter(filterName: string): Promise<void> {
    if (this.filteringStatus === "pending") {
      return Promise.reject();
    }
    this.setFilteringStatus = "pending";
    if (this.filter.name === filterName) {
      this.resetFilterState();
    } else {
      this.filter = {
        name: filterName,
        options: defaultFilterOptions[filterName] || [],
      };
    }
    return when(() => this.filteringStatus === "success");
  }

  @action updateFilterOption(
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

  @action resetFilterState(): void {
    this.filter = {
      name: "",
      options: [],
    };
  }

  @action async loadImage(url: string): Promise<void> {
    try {
      await this.setUrl(" ");
      this.originalImageUrl  url;
      history.clear();
      this.clearCanvas = true;
      this.setUrl(url);
    } catch (e) {
      console.error(e);
    }
  }

  @action setDataUrl(value: string): void {
    if (value) {
      this.dataUrl = value;
    }
    if (this.updateDataUrl) {
      this.updateDataUrl = false;
    }
  }

 getDataUrl(): Promise<string> {
    this.updateDataUrl = true;
    return new Promise(resolve => {
      when(
        () => this.updateDataUrl === false,
        () => resolve(this.dataUrl),
      );
    });
  }

  set setLoadingStatus(status: Status) {
    this.loadingStatus = status;
  }

  set setFilteringStatus(status: Status) {
    this.filteringStatus = status;
  }

  set setFlippingStatus(status: Status) {
    this.flippingStatus = status;
  }

  @disableHistoryRecording
  private async resetState(): Promise<void> {
    this.setBaseScale(1);
    this.setAngle(0);
    await this.setFlipX(false);
    await this.setFlipY(false);
  }
}

export default new ImageStore();
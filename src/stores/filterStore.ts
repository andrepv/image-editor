import applyFilter from "../helpers/applyFilter";
import { setImageCommand } from "../command/setImage";
import { FilterImageCommand } from "../command/filter";
import rootStore from "../stores/rootStore";
import { ImageStore } from "../stores/imageStore";
import { CanvasStore, Status } from "../stores/canvasStore";
import { observable, reaction, action, when } from "mobx";
import defaultFilterOptions from "../helpers/defaultFilterOptions";

export default class FilterStore {
  @observable filter: any = observable({
    name: "",
    options: [],
  });
  currentFilterName: string = "";
  previousFilteredImage: string;
  @observable private filteringStatus: Status = "success";
  private previousFilterName: string = "";
  private tmpCanvas: HTMLCanvasElement | null = null;
  private shouldApplyFilter: boolean = true;
  private filteredImage: string = "";
  private readonly image: ImageStore;
  private readonly canvas: CanvasStore;

  constructor(image: ImageStore, canvasAPI: CanvasStore) {
    this.image = image;
    this.canvas = canvasAPI;
    this.previousFilteredImage = this.image.element.src;
    reaction(
      () => [
        this.filter.name,
        this.filter.options,
      ],
      filter => {
        const [name, options] = filter;
        if (this.currentFilterName === name) {
          this.addFilter({name, options}, true);
          return;
        }

        if (!name && !this.currentFilterName) {
          return;
        }

        this.previousFilterName = this.currentFilterName;
        this.currentFilterName = name;

        if (!this.image.instance) {
          return;
        }
        if (name) {
          this.addFilter({name, options});
        } else {
          this.removeFilter();
        }
      },
    );
  }

  @action add(filterName: string): Promise<void> {
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

  private set setFilteringStatus(status: Status) {
    this.filteringStatus = status;
  }

  async addFilter(filter: any, areOptionsUpdated = false): Promise<void> {
    if (!this.shouldApplyFilter) {
      return;
    };
    this.updateTmpCanvas();
    await this.drawImageOnTmpCanvas();
    this.applyFilter(filter);

    if (this.tmpCanvas) {
      this.filteredImage = this.tmpCanvas.toDataURL();
      !areOptionsUpdated && this.saveCommandToHistory();
      this.setCanvasImage(this.filteredImage);
    }
  }

  removeFilter(): void {
    if (!this.shouldApplyFilter) {
      return;
    }
    this.setCanvasImage(this.image.element.src);
    this.filteredImage = "";
    this.saveCommandToHistory();
  }

  initialize(): void {
    this.shouldApplyFilter = true;
    this.previousFilteredImage = this.image.element.src;
  }

  destroy(): void {
    this.shouldApplyFilter = false;
    this.resetFilterState();
    this.canvas.history.removeCommands("filter");
    this.saveFilter();
    this.previousFilterName = "";
  }

  private saveCommandToHistory(): void {
    this.canvas.history.push(
      new FilterImageCommand(this.previousFilterName),
    );
  }

  private saveFilter(): void {
    this.image.updateImageElement(this.filteredImage, () => {
      if (this.previousFilterName !== this.filteredImage) {
        this.canvas.history.push(
          new setImageCommand(
            this.previousFilteredImage,
            this.image.element.src,
            url => this.backToPreviousFilter(url),
          ),
        );
      }
    });
    this.filteredImage = "";
  }

  private backToPreviousFilter(url: string): Promise<void> {
    return new Promise((resolve) => {
      this.setCanvasImage(url, () => {
        this.previousFilteredImage = url;
        this.image.updateImageElement(url);
        resolve();
      });
    });
  }

  private updateTmpCanvas(): void {
    if (!this.tmpCanvas) {
      this.tmpCanvas = document.createElement("canvas");
    }
    const {width, height} = this.getImageSize();
    this.tmpCanvas.width = width;
    this.tmpCanvas.height = height;
  }

  private drawImageOnTmpCanvas(): Promise<void> {
    return new Promise((resolve, reject) => {
      const context = this.tmpCanvas?.getContext("2d");
      if (!context) {
        return reject();
      }
      const img = new Image();
      const {width, height} = this.getImageSize();
      img.setAttribute("crossorigin", "anonymous");
      img.addEventListener("load", () => {
        context.drawImage(img, 0, 0, width, height);
        resolve();
      });
      img.src = this.image.element.src;
    });
  }

  private applyFilter(filter: any): void {
    const context = this.tmpCanvas?.getContext("2d");
    if (!context) {
      return;
    }
    const {width, height} = this.getImageSize();
    const imageData = context.getImageData(
      0, 0, width, height,
    );
    try {
      context.putImageData(
        applyFilter(imageData, filter.name, filter.options), 0, 0,
      );
    } catch (error) {
      console.error(error);
    }
  }

  private setCanvasImage(url: string, callback = () => {}): void {
    const imageElement = new Image();
    imageElement.setAttribute("crossorigin", "anonymous");
    imageElement.addEventListener("load", () => {
      if (!this.image.instance) {
        return;
      }
      this.canvas.instance.setZoom(1);
      const image = this.image.instance.setElement(imageElement);
      if (!image) {
        return;
      }
      this.image.adjustImage(image);
      image.scale((image?.scaleX ?? 1) / rootStore.canvasStore.scale);
      this.canvas.instance.setZoom(rootStore.canvasStore.scale);
      this.canvas.instance.renderAll();

      callback();
      this.setFilteringStatus = "success";
    });
    imageElement.src = url;
  }

  private getImageSize(): {width: number, height: number} {
    return {
      width: this.image.instance?.width ?? 0,
      height: this.image.instance?.height ?? 0,
    };
  }
}
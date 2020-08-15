import CanvasImage from "./Image";
import CanvasAPI from "./CanvasAPI";
import applyFilter from "../helpers/applyFilter";
import imageStore from "../stores/imageStore";
import { setImageCommand } from "../command/setImage";
import { FilterImageCommand } from "../command/filter";

export default class Filter {
  public previousFilterName: string = "";
  public currentFilterName: string = "";
  public previousFilteredImage: string;
  private readonly image: CanvasImage;
  private readonly canvasAPI: CanvasAPI;
  private tmpCanvas: HTMLCanvasElement | null = null;
  private shouldApplyFilter: boolean = true;
  private filteredImage: string = "";

  constructor(image: CanvasImage, canvasAPI: CanvasAPI) {
    this.image = image;
    this.canvasAPI = canvasAPI;
    this.previousFilteredImage = this.image.imageElement.src;
  }

  public addFilter(filter: any, areOptionsUpdated = false): void {
    if (!this.shouldApplyFilter) {
      return;
    };
    this.image.rotation.handleObjectAtAngle(
      this.image.imageObject,
      () => {
        this.updateTmpCanvas();

        this.drawImageOnTmpCanvas(() => {
          this.applyFilter(filter);

          if (this.tmpCanvas) {
            this.filteredImage = this.tmpCanvas.toDataURL();
            !areOptionsUpdated && this.saveCommandToHistory();
            this.setCanvasImage(this.filteredImage);
          }
        });
      },
    );
  }

  public removeFilter(): void {
    if (!this.shouldApplyFilter) {
      return;
    }
    this.setCanvasImage(this.image.imageElement.src);
    this.filteredImage = "";
    this.saveCommandToHistory();
  }

  public initialize(): void {
    this.shouldApplyFilter = true;
    this.previousFilteredImage = this.image.imageElement.src;
  }

  public destroy(): void {
    this.shouldApplyFilter = false;
    imageStore.resetFilterState();
    this.canvasAPI.history.removeCommands("filter");
    this.saveFilter();
    this.previousFilterName = "";
  }

  private saveCommandToHistory(): void {
    this.canvasAPI.addCommandToHistory(
      new FilterImageCommand(this.previousFilterName),
    );
  }

  private saveFilter(): void {
    this.image.updateImageElement(this.filteredImage, () => {
      if (this.previousFilterName !== this.filteredImage) {
        this.canvasAPI.addCommandToHistory(
          new setImageCommand(
            this.previousFilteredImage,
            this.image.imageElement.src,
            url => this.backToPreviousFilter(url),
          ),
        );
      }
    });
    this.filteredImage = "";
  }

  private backToPreviousFilter(url: string): void {
    this.image.rotation.handleObjectAtAngle(
      this.image.imageObject,
      () => {
        this.setCanvasImage(url, () => {
          this.previousFilteredImage = url;
          this.image.updateImageElement(url);
        });
      },
    );
  }

  private updateTmpCanvas(): void {
    if (!this.tmpCanvas) {
      this.tmpCanvas = document.createElement("canvas");
    }
    const {width, height} = this.getImageSize();
    this.tmpCanvas.width = width;
    this.tmpCanvas.height = height;
  }

  private drawImageOnTmpCanvas(onImageLoadCallback: () => void): void {
    const context = this.tmpCanvas?.getContext("2d");
    if (!context) {
      return;
    }
    const img = new Image();
    const {width, height} = this.getImageSize();
    img.setAttribute("crossorigin", "anonymous");
    img.addEventListener("load", () => {
      context.drawImage(img, 0, 0, width, height);
      onImageLoadCallback();
    });
    img.src = this.image.imageElement.src;
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

  private setCanvasImage(url: string, callback?: () => void): void {
    const imageElement = new Image();
    imageElement.setAttribute("crossorigin", "anonymous");
    imageElement.addEventListener("load", () => {
      if (!this.image.imageObject) {
        return;
      }
      const image = this.image.imageObject.setElement(imageElement);
      this.image.adjustImage(image);
      image.center().setCoords();
      this.canvasAPI.canvas.renderAll();

      callback && callback();
      imageStore.updateImageFilteringStatus("success");
    });
    imageElement.src = url;
  }

  private getImageSize(): {width: number, height: number} {
    return {
      width: this.image.imageObject?.width ?? 0,
      height: this.image.imageObject?.height ?? 0,
    };
  }
}
import CanvasImage from "./Image";
import CanvasAPI from "./CanvasAPI";
import applyFilter from "../helpers/applyFilter";
import imageStore from "../stores/imageStore";

export default class Filter {
  private readonly image: CanvasImage;
  private readonly canvasAPI: CanvasAPI;
  private tmpCanvas: HTMLCanvasElement | null = null;
  private shouldApplyFilter: boolean = true;
  private filteredImageDataURL: string = "";

  constructor(image: CanvasImage, canvasAPI: CanvasAPI) {
    this.image = image;
    this.canvasAPI = canvasAPI;
  }

  public addFilter(filter: any): void {
    if (!this.shouldApplyFilter) {
      return;
    };
    this.image.handleObjectAccordingToTiltAngle(
      this.image.imageElement,
      () => {
        this.updateTmpCanvas();

        this.drawImageOnTmpCanvas(() => {
          this.applyFilter(filter);
          if (this.tmpCanvas) {
            this.filteredImageDataURL = this.tmpCanvas.toDataURL();
            this.setCanvasImage(this.filteredImageDataURL);
          }
        });
      },
    );
  }

  public removeFilter(): void {
    if (!this.shouldApplyFilter) {
      return;
    }
    this.setCanvasImage(this.image.originalImage.src);
    this.filteredImageDataURL = "";
  }

  public initialize(): void {
    this.shouldApplyFilter = true;
  }

  public destroy(): void {
    this.shouldApplyFilter = false;
    imageStore.resetFilterState();

    const image = new Image();
    image.addEventListener("load", () => {
      this.image.originalImage = image;
    });
    image.src = this.filteredImageDataURL;
    this.filteredImageDataURL = "";
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
    img.src = this.image.originalImage.src;
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

  private setCanvasImage(url: string): void {
    const imageElement = new Image();
    imageElement.setAttribute("crossorigin", "anonymous");
    imageElement.addEventListener("load", () => {
      if (!this.image.imageElement) {
        return;
      }
      const image = this.image.imageElement.setElement(imageElement);
      this.image.adjustImage(image);
      image.center().setCoords();
      this.canvasAPI.canvas.renderAll();

    });
    imageElement.src = url;
  }

  private getImageSize(): {width: number, height: number} {
    return {
      width: this.image.imageElement?.width ?? 0,
      height: this.image.imageElement?.height ?? 0,
    };
  }
}
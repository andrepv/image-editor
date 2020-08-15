import CanvasAPI from "./CanvasAPI";
import { fabric } from "fabric";
import cropperStore, { Ratio } from "../stores/cropperStore";
import { autorun } from "mobx";
import RenderingCropZone from "./RenderingCropZone";
import { CropCommand } from "../command/crop";

type CropZoneInfo = {
  width: number,
  height: number,
  x: number,
  y: number,
}

export default class CropZone {
  public width: number = 0;
  public height: number = 0;
  public left: number = 0;
  public top: number = 0;
  public isFocused: boolean = false;
  private aspectRatio: Ratio = cropperStore.ratio;
  private readonly canvasAPI: CanvasAPI;
  private readonly rendering: RenderingCropZone;

  constructor(canvasAPI: CanvasAPI) {
    this.canvasAPI = canvasAPI;
    this.rendering = new RenderingCropZone(this, canvasAPI);
  }

  public initialize(): void {
    const {width, height} = this.canvasAPI.canvasSize;
    this.setInitialSize();
    this.setLeft(width / 2 - this.width / 2);
    this.setTop(height / 2 - this.height / 2);
    this.toggleFocus(true);
  }

  private setInitialSize(): void {
    const {canvasSize} = this.canvasAPI;
    let width = canvasSize.width;
    let height = canvasSize.height;
    if (this.aspectRatio) {
      const size = this.convertAspectRatioToActualSize(
        canvasSize.width,
        canvasSize.height,
      );
      if (size) {
        width = size.width;
        height = size.height;
      }
    }
    this.setWidth(width);
    this.setHeight(height);
  }

  private convertAspectRatioToActualSize(
    containerWidth: number,
    containerHeight: number,
  ): Ratio {
    if (!this.aspectRatio) {
      return null;
    }
    const height = Math.min(
      this.aspectRatio.height * containerWidth / this.aspectRatio.width,
      containerHeight,
    );
    const width = Math.min(
      this.aspectRatio.width / this.aspectRatio.height * containerHeight,
      containerWidth,
    );
    return {width, height};
  }

  public remove(): void {
    this.rendering.removeAll();
  }

  public toggleFocus(value: boolean): void {
    this.isFocused = value;
    this.rendering.render();
  }

  public move(left: number, top: number): void {
    this.moveLeft(left);
    this.moveTop(top);
    this.rendering.render();
  }

  public moveLeft(value: number): void {
    const { canvasSize } = this.canvasAPI;
    let left = Math.max(value, 0);
    if (value + this.width > canvasSize.width) {
      left = canvasSize.width - this.width;
    }
    this.setLeft(left);
  }

  public moveTop(value: number): void {
    const { canvasSize } = this.canvasAPI;
    let top = Math.max(value, 0);
    if (value + this.height > canvasSize.height) {
      top = canvasSize.height - this.height;
    }
    this.setTop(top);
  }

  private getMinSize(): {
    minWidth: number;
    minHeight: number;
    minX: number;
    minY: number
  } {
    let minWidth = 40;
    let minHeight = 40;
    if (this.aspectRatio) {
      const minSize = this.convertAspectRatioToActualSize(
        minWidth,
        minHeight,
      );
      if (minSize) {
        minWidth = minSize.width;
        minHeight = minSize.height;
      }
    }
    return {
      minWidth,
      minHeight,
      minX: this.left + this.width - minWidth,
      minY: this.top + this.height - minHeight,
    };
  }

  private getMaxSize(corner: string = "br"): {
    maxWidth: number;
    maxHeight: number;
    maxX: number;
    maxY: number;
  } {
    const {canvasSize} = this.canvasAPI;
    const maxDimensions: any = {
      tl: {
        width: this.left + this.width,
        height: this.top + this.height,
      },
      tr: {
        width: canvasSize.width - this.left,
        height: this.top + this.height,
      },
      br: {
        width: canvasSize.width - this.left,
        height: canvasSize.height - this.top,
      },
      bl: {
        width: this.left + this.width,
        height: canvasSize.height - this.top,
      },
    };
    maxDimensions.mt = maxDimensions.tr;
    maxDimensions.mr = maxDimensions.br;
    maxDimensions.mb = maxDimensions.br;
    maxDimensions.ml = maxDimensions.bl;

    let maxWidth = maxDimensions[corner].width;
    let maxHeight = maxDimensions[corner].height;

    if (this.aspectRatio) {
      const maxSize = this.convertAspectRatioToActualSize(
        maxWidth,
        maxHeight,
      );
      if (maxSize) {
        maxWidth = maxSize.width;
        maxHeight = maxSize.height;
      }
    }
    return {
      maxWidth,
      maxHeight,
      maxX: this.left + this.width - maxWidth,
      maxY: this.top + this.height - maxHeight,
    };
  }

  public resize(cropZoneInfo: CropZoneInfo, corner: string): void {
    const adjustedCropZone = this.adjustCropZoneWithAspectRatio(
      cropZoneInfo,
      corner,
    );
    const {x, y, width, height} = this.adjustCropZoneWithMinValues(
      adjustedCropZone,
      corner,
    );

    this.setWidth(width);
    this.setHeight(height);
    this.setTop(y);
    this.setLeft(x);

    this.rendering.render();
  }

  private adjustCropZoneWithAspectRatio(
    cropZoneInfo: CropZoneInfo,
    corner: string,
  ): CropZoneInfo {

    if (!this.aspectRatio) {
      return cropZoneInfo;
    }

    let {width, height, x, y} = cropZoneInfo;
    const {maxWidth, maxHeight, maxX, maxY} = this.getMaxSize(corner);

    if (corner !== "mt" && corner !== "mb") {
      height = this.getProportionalHeightValue(width);
    }
    if (corner === "mt" || corner === "mb") {
      width = this.getProportionalWidthValue(height);
    }

    if (corner === "tl" || corner === "tr") {
      y = this.top + (this.height - height);
    }
    if (corner === "br" || corner === "bl") {
      y = this.top;
    }

    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);
    x = Math.max(x, maxX);
    y = Math.max(y, maxY);

    return {width, height, x, y};
  }

  private adjustCropZoneWithMinValues(
    values: CropZoneInfo,
    corner: string,
  ): CropZoneInfo {
    const {minWidth, minHeight, minX, minY} = this.getMinSize();

    let x = corner === "mr" || corner === "tr" || corner === "br"
      ? Math.max(values.x, this.left)
      : Math.min(values.x, minX);

    let y = corner === "mb" || corner === "bl" || corner === "br"
      ? Math.max(values.y, this.top)
      : Math.min(values.y, minY);

    const width = Math.max(values.width, minWidth);
    const height = Math.max(values.height, minHeight);

    return {x, y, width, height};
  }

  private getProportionalWidthValue(height: number): number {
    if (!this.aspectRatio) {
      return height;
    }
    return (this.aspectRatio.width / this.aspectRatio.height) * height;
  }

  private getProportionalHeightValue(width: number): number {
    if (!this.aspectRatio) {
      return width;
    }
    return width / (this.aspectRatio.width / this.aspectRatio.height);
  }

  private setWidth(value: number): void {
    this.width = value;
    cropperStore.setWidthIndicatorValue(value);
  }

  private setHeight(value: number): void {
    this.height = value;
    cropperStore.setHeightIndicatorValue(value);
  }

  private setLeft(value: number): void {
    this.left = value;
  }

  private setTop(value: number): void {
    this.top = value;
  }

  private getImagesAspectRatio(): number {
    const {imageElement, flipX, flipY, angle} = this.canvasAPI.image;
    const image = new fabric.Image(imageElement, {flipX, flipY});
    image.rotate(angle).setCoords();
    const actualImageWidth = this.canvasAPI.canvasSize.width;
    const originalImageWidth = image.getBoundingRect().width;
    return originalImageWidth / actualImageWidth;
  }

  private updateWidth = autorun(() => {
    if (this.width !== cropperStore.cropZoneWidth) {
      const {minWidth} = this.getMinSize();
      const {maxWidth} = this.getMaxSize();

      let width = Math.max(cropperStore.cropZoneWidth, minWidth);
      width = Math.min(width, maxWidth);

      this.setWidth(width);
      if (this.aspectRatio) {
        this.setHeight(this.getProportionalHeightValue(this.width));
      }
      this.rendering.render();
    }
  });

  private updateHeight = autorun(() => {
    if (this.height !== cropperStore.cropZoneHeight) {
      const {minHeight} = this.getMinSize();
      const {maxHeight} = this.getMaxSize();

      let height = Math.max(cropperStore.cropZoneHeight, minHeight);
      height = Math.min(height, maxHeight);

      this.setHeight(height);
      if (this.aspectRatio) {
        this.setWidth(this.getProportionalWidthValue(this.height));
      }
      this.rendering.render();
    }
  });

  private updateRatio = autorun(() => {
    this.aspectRatio = cropperStore.ratio;
    this.initialize();
  });

  private crop = autorun(() => {
    if (cropperStore.shouldCrop) {
      this.rendering.removeAll();
      const ratio = this.getImagesAspectRatio();
      this.canvasAPI.image.zoom(ratio);

      const croppedImageUrl = this.canvasAPI.canvas.toDataURL({
        left: this.left * ratio,
        top: this.top * ratio,
        width: this.width * ratio,
        height: this.height * ratio,
      });
      this.canvasAPI.image.zoom(1);
      this.canvasAPI.executeCommand(
        new CropCommand(
          croppedImageUrl,
          this.canvasAPI.image.imageElement.src,
          this.canvasAPI.canvas.getObjects(),
        ),
      );
      cropperStore.crop(false);
    }
  });
}
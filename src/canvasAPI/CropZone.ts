import { fabric } from "fabric";
import { Ratio } from "../stores/cropperStore";
import { observable, action } from "mobx";
import RenderingCropZone from "./RenderingCropZone";
import { CropCommand } from "../command/crop";
import { CanvasStore } from "../stores/canvasStore";
import { ImageStore } from "../stores/imageStore";

type CropZoneInfo = {
  width: number,
  height: number,
  x: number,
  y: number,
}

export default class CropZone {
  @observable width: number = 0;
  @observable height: number = 0;
  left: number = 0;
  top: number = 0;
  isFocused: boolean = false;
  private readonly rendering: RenderingCropZone;
  private ratio: Ratio = null;

  constructor(
    private readonly canvas: CanvasStore,
    private readonly image: ImageStore,
  ) {
    this.rendering = new RenderingCropZone(this);
  }

  create(): void {
    const {width, height} = this.canvas.size;
    this.setInitialSize();
    this.setLeft(width / 2 - this.width / 2);
    this.setTop(height / 2 - this.height / 2);
    this.toggleFocus(true);
  }

  remove(): void {
    this.rendering.removeAll();
  }

  toggleFocus(value: boolean): void {
    this.isFocused = value;
    this.rendering.render();
  }

  move(left: number, top: number): void {
    this.moveLeft(left);
    this.moveTop(top);
    this.rendering.render();
  }

  moveLeft(value: number): void {
    const { size: canvasSize } = this.canvas;
    let left = Math.max(value, 0);
    if (value + this.width > canvasSize.width) {
      left = canvasSize.width - this.width;
    }
    this.setLeft(left);
  }

  moveTop(value: number): void {
    const { size: canvasSize } = this.canvas;
    let top = Math.max(value, 0);
    if (value + this.height > canvasSize.height) {
      top = canvasSize.height - this.height;
    }
    this.setTop(top);
  }

  updateWidth(cropZoneWidth: number): void {
    if (this.width !== cropZoneWidth) {
      const {minWidth} = this.getMinSize();
      const {maxWidth} = this.getMaxSize();

      let width = Math.max(cropZoneWidth, minWidth);
      width = Math.min(width, maxWidth);

      this.setWidth(width);
      if (this.ratio) {
        this.setHeight(this.getProportionalHeightValue(this.width));
      }
      this.rendering.render();
    }
  }

  updateHeight(cropZoneHeight: number): void {
    if (this.height !== cropZoneHeight) {
      const {minHeight} = this.getMinSize();
      const {maxHeight} = this.getMaxSize();

      let height = Math.max(cropZoneHeight, minHeight);
      height = Math.min(height, maxHeight);

      this.setHeight(height);
      if (this.ratio) {
        this.setWidth(this.getProportionalWidthValue(this.height));
      }
      this.rendering.render();
    }
  }

  setRatio(ratio: Ratio): void {
    this.ratio = ratio;
    this.create();
  }

  resize(cropZoneInfo: CropZoneInfo, corner: string): void {
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

  crop(): void {
    this.rendering.removeAll();
    const ratio = this.getImagesAspectRatio();
    this.canvas.setZoom(ratio);

    const croppedImageUrl = this.canvas.instance.toDataURL({
      left: this.left * ratio,
      top: this.top * ratio,
      width: this.width * ratio,
      height: this.height * ratio,
    });
    this.canvas.setZoom(1);
    const cropCommand = new CropCommand(
      croppedImageUrl,
      this.image.element.src,
      this.canvas.instance.getObjects(),
    );
    this.canvas.history.push(cropCommand);
    cropCommand.execute();
  }

  private setInitialSize(): void {
    const {size: canvasSize} = this.canvas;
    let width = canvasSize.width;
    let height = canvasSize.height;
    if (this.ratio) {
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
    if (!this.ratio) {
      return null;
    }
    const height = Math.min(
      this.ratio.height * containerWidth / this.ratio.width,
      containerHeight,
    );
    const width = Math.min(
      this.ratio.width / this.ratio.height * containerHeight,
      containerWidth,
    );
    return {width, height};
  }

  private getMinSize(): {
    minWidth: number;
    minHeight: number;
    minX: number;
    minY: number
  } {
    let minWidth = 40;
    let minHeight = 40;
    if (this.ratio) {
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
    const {size: canvasSize} = this.canvas;
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

    if (this.ratio) {
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

  private adjustCropZoneWithAspectRatio(
    cropZoneInfo: CropZoneInfo,
    corner: string,
  ): CropZoneInfo {

    if (!this.ratio) {
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
    if (!this.ratio) {
      return height;
    }
    return (this.ratio.width / this.ratio.height) * height;
  }

  private getProportionalHeightValue(width: number): number {
    if (!this.ratio) {
      return width;
    }
    return width / (this.ratio.width / this.ratio.height);
  }

  @action private setWidth(value: number): void {
    this.width = value;
  }

  @action private setHeight(value: number): void {
    this.height = value;
  }

  private setLeft(value: number): void {
    this.left = value;
  }

  private setTop(value: number): void {
    this.top = value;
  }

  private getImagesAspectRatio(): number {
    const {element: imageElement} = this.image;
    const {flipX, flipY, angle} = this.canvas;
    const image = new fabric.Image(imageElement, {flipX, flipY});
    image.rotate(angle).setCoords();
    const actualImageWidth = this.canvas.size.width;
    const originalImageWidth = image.getBoundingRect().width;
    return originalImageWidth / actualImageWidth;
  }
}
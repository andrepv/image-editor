import imageStore from "../stores/imageStore";
import CanvasImage from "./Image";
import CanvasAPI from "./CanvasAPI";

export default class Scaling {
  public scale: number = 1;

  constructor(
    private image: CanvasImage,
    private canvasAPI: CanvasAPI,
  ) {}

  public setZoom(scale: number): void {
    this.scale = scale;
    this.image.setSize();
    this.canvasAPI.canvas.setZoom(scale);
  }

  public setBaseScale(): void {
    const scale = this.getBaseScale();
    imageStore.setBaseScale(scale);
  }

  public getBaseScale(): number {
    const canvasContainer = document.querySelector(".canvas");
    const containerHeight = canvasContainer?.clientHeight ?? this.image.height;
    const scale = Math.floor(containerHeight * 100 / this.image.height);
    if (scale) {
      return (scale - (scale % 10)) / 100;
    }
    return 1;
  }
}
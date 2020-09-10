import rootStore from "../stores/rootStore";

export default class Scaling {
  setZoom(scale: number): void {
    rootStore.imageStore.setSize();
    rootStore.canvasStore.instance.setZoom(scale);
  }

  setBaseScale(): void {
    const scale = this.getBaseScale();
    rootStore.canvasStore.setBaseScale(scale);
  }

  getBaseScale(): number {
    const canvasContainer = document.querySelector(".canvas");
    const containerHeight = canvasContainer?.clientHeight ?? rootStore.imageStore.height;
    const scale = Math.floor(containerHeight * 100 / rootStore.imageStore.height);
    if (scale) {
      return (scale - (scale % 10)) / 100;
    }
    return 1;
  }
}
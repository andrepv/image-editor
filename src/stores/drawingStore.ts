import { observable, action } from "mobx";

export class DrawingStore {
  @observable opacity: number = 1;
  @observable colorCode: string = "61, 61, 61";
  @observable color: string = this.getColor();
  @observable lineWidth: number = 1;
  @observable isLineStraight: boolean = false;

  @action setColorCode(colorCode: string): void {
    this.colorCode = colorCode;
    this.color = this.getColor();
  }

  @action setLineWidth(value: number): void {
    this.lineWidth = value;
  }

  @action setOpacity(value: number): void {
    this.opacity = value;
    this.color = this.getColor();
  }

  @action toggleFreeDrawingMode(): void {
    this.isLineStraight = !this.isLineStraight;
  }

  private getColor(): string {
    return `rgba(${this.colorCode}, ${this.opacity})`;
  }
}

export default new DrawingStore();
import { observable, action } from "mobx";

export class DrawingStore {
  @observable public opacity: number = 1;
  @observable public colorCode: string = "61, 61, 61";
  @observable public color: string = this.getColor();
  @observable public lineWidth: number = 1;
  @observable public isLineStraight: boolean = false;

  @action public setColorCode(colorCode: string): void {
    this.colorCode = colorCode;
    this.color = this.getColor();
  }

  @action public setLineWidth(value: number): void {
    this.lineWidth = value;
  }

  @action public setOpacity(value: number): void {
    this.opacity = value;
    this.color = this.getColor();
  }

  @action public toggleFreeDrawingMode(): void {
    this.isLineStraight = !this.isLineStraight;
  }

  private getColor(): string {
    return `rgba(${this.colorCode}, ${this.opacity})`;
  }
}

export default new DrawingStore();
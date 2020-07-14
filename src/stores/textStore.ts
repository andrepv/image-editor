import { observable, action } from "mobx";


export enum TextСonstants {
  MIN_FONT_SIZE = 10,
  MAX_FONT_SIZE = 200,
  INIT_FONT_SIZE = 40,
  MIN_LINE_HEIGHT = 1,
  MAX_LINE_HEIGHT = 10,
};

export class TextStore {
  @observable public isTextControlHidden: boolean = false;
  @observable public shouldAddText: boolean = false;
  @observable public fontWeight: string = "normal";
  @observable public underline: boolean = false;
  @observable public fontStyle: string = "normal";
  @observable public textAlign: string = "left";
  @observable public fontSizeIndicator: number = TextСonstants.INIT_FONT_SIZE;
  @observable public fontSize: number = TextСonstants.INIT_FONT_SIZE;
  @observable public lineHeight: number = TextСonstants.MIN_LINE_HEIGHT;
  @observable public fontColorCode: string = "61, 61, 61";
  @observable public fontColor: string = `rgb(${this.fontColorCode})`;
  @observable public isBackgroundTransparent: boolean = true;
  @observable public backgroundColorCode: string = "255, 255, 255";

  @action public addText(): void {
    this.shouldAddText = true;
  }

  @action public setFontWeight(value: string): void {
    this.fontWeight = value;
  }

  @action public setTextDecoration(value: boolean): void {
    this.underline = value;
  }

  @action public setFontStyle(value: string): void {
    this.fontStyle = value;
  }

  @action public setTextAlign(type: string): void {
    this.textAlign = type;
  }

  @action public setFontSize(value: number | undefined): void {
    if (!value) {
      return;
    }
    this.fontSize = value as number;
  }

  @action public updateFontSizeIndicator(value: number): void {
    this.fontSizeIndicator = value;
  }

  @action public setLineHeight(value: number | undefined): void {
    if (!value) {
      return;
    }
    this.lineHeight = value as number;
  }

  @action public setFontColor(rgbCode: string): void {
    this.fontColorCode = rgbCode;
    this.fontColor = `rgb(${rgbCode})`;
  }

  @action public setBackgroundTransparency(value: boolean): void {
    this.isBackgroundTransparent = value;
  }

  @action public setBackgroundColor(rgbCode: string): void {
    this.backgroundColorCode = rgbCode;
  }

  @action public resetToDefault(): void {
    this.fontWeight = "normal";
    this.underline = false;
    this.fontStyle = "normal";
    this.textAlign = "left";
    this.fontSizeIndicator = TextСonstants.INIT_FONT_SIZE;
    this.fontSize = TextСonstants.INIT_FONT_SIZE;
    this.lineHeight = TextСonstants.MIN_LINE_HEIGHT;
    this.fontColorCode = "61, 61, 61";
    this.fontColor = `rgb(${this.fontColorCode})`;
    this.backgroundColorCode = "255, 255, 255";
    this.isBackgroundTransparent = true;
  }

  public set isTextSelected(value: boolean) {
    this.isTextControlHidden = value;
  }

  public toggleFontWeight(): void {
    if (this.fontWeight === "normal") {
      this.setFontWeight("bold");
      return;
    }
    this.setFontWeight("normal");
  }

  public toggleTextDecoration(): void {
    this.setTextDecoration(!this.underline);
  }

  public toggleFontStyle(): void {
    if (this.fontStyle === "normal") {
      this.setFontStyle("italic");
      return;
    }
    this.setFontStyle("normal");
  }

  public toggleBackgroundTransparency(): void {
    this.setBackgroundTransparency(!this.isBackgroundTransparent);
  }
}

export default new TextStore();
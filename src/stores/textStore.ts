import { observable, action } from "mobx";


export enum TextСonstants {
  MIN_FONT_SIZE = 10,
  MAX_FONT_SIZE = 200,
  INIT_FONT_SIZE = 40,
  MIN_LINE_HEIGHT = 1,
  MAX_LINE_HEIGHT = 10,
};

export class TextStore {
  @observable isTextControlHidden: boolean = false;
  @observable shouldAddText: boolean = false;
  @observable shouldRemoveText: boolean = false;
  @observable fontWeight: string = "normal";
  @observable underline: boolean = false;
  @observable fontStyle: string = "normal";
  @observable textAlign: string = "left";
  @observable fontSizeIndicator: number = TextСonstants.INIT_FONT_SIZE;
  @observable fontSize: number = TextСonstants.INIT_FONT_SIZE;
  @observable lineHeight: number = TextСonstants.MIN_LINE_HEIGHT;
  @observable fontColorCode: string = "61, 61, 61";
  @observable fontColor: string = `rgb(${this.fontColorCode})`;
  @observable isBackgroundTransparent: boolean = true;
  @observable backgroundColorCode: string = "255, 255, 255";

  @action addText(): void {
    this.shouldAddText = true;
  }

  @action removeText(): void {
    this.shouldRemoveText = true;
  }

  @action setFontWeight(value: string): void {
    this.fontWeight = value;
  }

  @action setTextDecoration(value: boolean): void {
    this.underline = value;
  }

  @action setFontStyle(value: string): void {
    this.fontStyle = value;
  }

  @action setTextAlign(type: string): void {
    this.textAlign = type;
  }

  @action setFontSize(value: number | undefined): void {
    if (!value) {
      return;
    }
    this.fontSize = value as number;
  }

  @action updateFontSizeIndicator(value: number): void {
    this.fontSizeIndicator = value;
  }

  @action setLineHeight(value: number | undefined): void {
    if (!value) {
      return;
    }
    this.lineHeight = value as number;
  }

  @action setFontColor(rgbCode: string): void {
    this.fontColorCode = rgbCode;
    this.fontColor = `rgb(${rgbCode})`;
  }

  @action setBackgroundTransparency(value: boolean): void {
    this.isBackgroundTransparent = value;
  }

  @action setBackgroundColor(rgbCode: string): void {
    this.backgroundColorCode = rgbCode;
  }

  @action resetToDefault(): void {
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

  set isTextSelected(value: boolean) {
    this.isTextControlHidden = value;
  }

  toggleFontWeight(): void {
    if (this.fontWeight === "normal") {
      this.setFontWeight("bold");
      return;
    }
    this.setFontWeight("normal");
  }

  toggleTextDecoration(): void {
    this.setTextDecoration(!this.underline);
  }

  toggleFontStyle(): void {
    if (this.fontStyle === "normal") {
      this.setFontStyle("italic");
      return;
    }
    this.setFontStyle("normal");
  }

  toggleBackgroundTransparency(): void {
    this.setBackgroundTransparency(!this.isBackgroundTransparent);
  }
}

export default new TextStore();
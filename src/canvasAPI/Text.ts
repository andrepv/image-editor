import { autorun } from "mobx";
import { fabric } from "fabric";
import textStore, { TextСonstants } from "../stores/textStore";

interface IText extends fabric.IText {
  fontColorCode: string;
  backgroundColorCode: string;
  isBackgroundTransparent: boolean;
  defaultFontSize: number;
}

export default class Text {
  private canvas: fabric.Canvas;
  private selectedText: any;
  private listeners: any;
  public readonly TEXT_OBJ_NAME: string = "text";

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.selectedText = new fabric.IText("") as IText;
    this.listeners = {
      onMouseDown: this.handleMouseDown.bind(this),
      onObjectScaling: this.handleObjectScaling.bind(this),
    };
  }

  public initialize(): void {
    this.canvas.discardActiveObject().renderAll();
    this.addEventListeners();
    this.lockCanvasObjects();
  }

  public destroy(): void {
    this.removeEventListeners();
    this.unlockCanvasObjects();
    this.canvas.discardActiveObject().renderAll();
    textStore.isTextSelected = false;
  }

  private lockCanvasObjects(): void {
    this.canvas.selection = false;
    this.canvas.forEachObject(obj => {
      if (obj.name !== this.TEXT_OBJ_NAME) {
        obj.set({
          evented: false,
        });
      }
    });
  }

  private unlockCanvasObjects(): void {
    this.canvas.selection = true;
    this.canvas.forEachObject(obj => {
      obj.set({
        evented: true,
      });
    });
  }

  private addEventListeners(): void {
    this.canvas.on("mouse:down", this.listeners.onMouseDown);
    this.canvas.on("object:scaling", this.listeners.onObjectScaling);
  }

  private removeEventListeners(): void {
    this.canvas.off("mouse:down", this.listeners.onMouseDown);
    this.canvas.off("object:scaling", this.listeners.onObjectScaling);
  }

  private handleMouseDown(event: fabric.IEvent): void {
    const {target} = event;
    const name = target?.name;
    if (!name || name !== this.TEXT_OBJ_NAME) {
      if (this.selectedText) {
        textStore.isTextSelected = false;
      }
      return;
    }
    this.selectedText = target as IText;
    textStore.isTextSelected = true;
    this.updateStore();
  }

  private updateStore(): void {
    let {
      fontWeight,
      underline,
      fontStyle,
      textAlign,
      scaleX,
      defaultFontSize,
      lineHeight,
      fontColorCode,
      backgroundColorCode,
      isBackgroundTransparent,
    } = this.selectedText;

    lineHeight = Math.floor((lineHeight as number - 1) * 10);
    const fontSize = defaultFontSize * scaleX as number;

    textStore.setFontWeight(fontWeight as string);
    textStore.setTextDecoration(underline as boolean);
    textStore.setFontStyle(fontStyle as string);
    textStore.setTextAlign(textAlign as string);
    textStore.updateFontSizeIndicator(fontSize);
    textStore.setLineHeight(lineHeight);
    textStore.setFontColor(fontColorCode);
    textStore.setBackgroundColor(backgroundColorCode);
    textStore.setBackgroundTransparency(isBackgroundTransparent);
  }

  private createText(): IText {
    const {
      fontSize,
      fontColor,
      lineHeight,
      fontColorCode,
      isBackgroundTransparent,
      backgroundColorCode,
    } = textStore;
    const text = new fabric.IText("click to select") as IText;
    text.set({
      name: this.TEXT_OBJ_NAME,
      fontSize,
      lineHeight,
      fill: fontColor,
    });
    text.fontColorCode = fontColorCode;
    text.isBackgroundTransparent = isBackgroundTransparent;
    text.backgroundColorCode = backgroundColorCode;
    text.defaultFontSize = TextСonstants.INIT_FONT_SIZE;
    return text;
  }

  private addText = autorun(() => {
    const {shouldAddText} = textStore;
    if (shouldAddText) {
      textStore.resetToDefault();
      this.selectedText = this.createText();
      this.canvas.add(this.selectedText);
      this.selectedText.center().setCoords();
      this.canvas.setActiveObject(this.selectedText);
      textStore.isTextSelected = true;
    }
    textStore.shouldAddText = false;
  });

  private updateFontWeight = autorun(() => {
    const {fontWeight} = textStore;
    this.selectedText.set({fontWeight});
    this.canvas.renderAll();
  });

  private updateTextDecoration = autorun(() => {
    const {underline} = textStore;
    this.selectedText.set({underline});
    this.canvas.renderAll();
  });

  private updateFontStyle = autorun(() => {
    const {fontStyle} = textStore;
    (this.selectedText as any).set({fontStyle});
    this.canvas.renderAll();
  });

  private updateTextAlign = autorun(() => {
    const {textAlign} = textStore;
    this.selectedText.set({textAlign});
    this.canvas.renderAll();
  });

  private updatefontSize = autorun(() => {
    const {fontSize} = textStore;
    this.selectedText.scaleX = 1;
    this.selectedText.scaleY = 1;
    this.selectedText.defaultFontSize = fontSize;
    this.selectedText.set({fontSize});
    this.canvas.renderAll();
  });

  private updateLineHeight = autorun(() => {
    const {lineHeight} = textStore;
    this.selectedText.set({lineHeight: 1 + lineHeight / 10});
    this.canvas.renderAll();
  });

  private updateFontColor = autorun(() => {
    const {fontColor, fontColorCode} = textStore;
    this.selectedText.fontColorCode = fontColorCode;
    this.selectedText.set({fill: fontColor});
    this.canvas.renderAll();
  });

  private updateBackgroundColor = autorun(() => {
    const {backgroundColorCode, isBackgroundTransparent} = textStore;
    this.selectedText.backgroundColorCode = backgroundColorCode;
    this.selectedText.isBackgroundTransparent = isBackgroundTransparent;
    this.selectedText.set({textBackgroundColor:
      `rgba(${backgroundColorCode}, ${Number(!isBackgroundTransparent)})`,
    });
    this.canvas.renderAll();
  });


  private handleObjectScaling(event: fabric.IEvent): void {
    const target = event.target as IText;
    if (!target) {
      return;
    }
    target.lockScalingFlip = true;
    const corner = event?.transform?.corner ?? "";
    if (corner === "mb" || corner === "mt") {
      target.scaleX = target.scaleY;
    } else if (corner === "mr" || corner === "ml") {
      target.scaleY = target.scaleX;
    }
    const {scaleX = 1, defaultFontSize} = target;
    target.minScaleLimit = TextСonstants.MIN_FONT_SIZE / defaultFontSize;
    textStore.updateFontSizeIndicator(defaultFontSize * scaleX);
  }
}
import { autorun } from "mobx";
import { fabric } from "fabric";
import textStore, { TextСonstants } from "../stores/textStore";
import CanvasAPI from "./CanvasAPI";
import objectManagerStore from "../stores/objectManagerStore";
import { ModeName } from "../stores/appStore";

interface IText extends fabric.IText {
  fontColorCode: string;
  backgroundColorCode: string;
  isBackgroundTransparent: boolean;
  defaultFontSize: number;
}

export default class Text {
  private canvasAPI: CanvasAPI;
  private canvas: fabric.Canvas;
  private selectedText: any;
  private listeners: any;
  public readonly OBJ_NAME: ModeName = "text";

  constructor(canvasAPI: CanvasAPI) {
    this.canvasAPI = canvasAPI;
    this.canvas = canvasAPI.canvas;
    this.selectedText = new fabric.IText("") as IText;
    this.listeners = {
      onObjectScaling: this.onObjectScaling.bind(this),
    };
    this.canvasAPI.objectManager.registerObject(this.OBJ_NAME);
  }

  public initialize(): void {
    this.addEventListeners();
    this.canvas.discardActiveObject().renderAll();
    this.canvasAPI.objectManager.deselectObject();
    this.canvasAPI.objectManager.lockObjects([this.OBJ_NAME]);
  }

  public destroy(): void {
    this.removeEventListeners();
    this.canvas.discardActiveObject().renderAll();
    textStore.isTextSelected = false;
    this.canvasAPI.objectManager.deselectObject();
    this.canvasAPI.objectManager.unlockObjects();
  }

  private addEventListeners(): void {
    this.canvas.on("object:scaling", this.listeners.onObjectScaling);
  }

  private removeEventListeners(): void {
    this.canvas.off("object:scaling", this.listeners.onObjectScaling);
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
      name: this.OBJ_NAME,
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

  private onDelete(): void {
    textStore.isTextSelected = false;
  }

  private onAdded(): void {
    textStore.resetToDefault();
    this.selectedText = this.createText();
    this.canvas.add(this.selectedText);
    this.selectedText.center().setCoords();
    this.canvas.setActiveObject(this.selectedText);
    textStore.isTextSelected = true;
    this.canvasAPI.objectManager.selectObject(this.selectedText);
  }

  private onSelect(target: fabric.Object): void {
    this.selectedText = target as IText;
    textStore.isTextSelected = true;
    this.updateStore();
  }

  private onDeselect(): void {
    textStore.isTextSelected = false;
  }

  private onToggleSelection = autorun(() => {
    const {selectedObject} = objectManagerStore;
    if (this.canvasAPI.mode !== "text") {
      return;
    }
    if (selectedObject) {
      this.onSelect(selectedObject);
    } else {
      this.onDeselect();
    }
  });

  private reactToDeletion = autorun(() => {
    const {notification} = objectManagerStore;
    if (this.canvasAPI.mode !== "text") {
      return;
    }
    if (notification.type === "obj_removed") {
      this.onDelete();
    }
  });

  private addText = autorun(() => {
    const {shouldAddText} = textStore;
    if (shouldAddText) {
      this.onAdded();
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

  private onObjectScaling(event: fabric.IEvent): void {
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
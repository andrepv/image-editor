import { computed, observable } from "mobx";
import { fabric } from "fabric";
import { ImageStore } from "./imageStore";
import { CanvasStore } from "./canvasStore";
import { EffectCommand } from "../command/effect";

export type EffectValue = number | string;

interface Effect {
  name: string;
  defaultValue: EffectValue;
  getValue: () => EffectValue;
  setValue: (value: EffectValue) => EffectValue;
  object?: fabric.IBaseFilter;
}

export default class EffectsStore {
  @observable private _brightness: number = 0;
  @observable private _contrast: number = 0;
  @observable private _saturation: number = 0;
  @observable private _tintColor: string = "#000";
  @observable private _tintOpacity: number = 0;
  @observable private _invert: number = 0;
  @observable private _hue: number = 0;
  @observable private _noise: number = 0;
  @observable private _blur: number = 0;
  @observable private _pixelate: number = 1;

  @computed get brightness(): number {
    return this._brightness;
  }

  set brightness(value: number) {
    this._brightness = value;
    this.updateEffectProp("brightness", value, 0);
  }

  @computed get contrast(): number {
    return this._contrast;
  }

  set contrast(value: number) {
    this._contrast = value;
    this.updateEffectProp("contrast", value, 1);
  }

  @computed get saturation(): number {
    return this._saturation;
  }

  set saturation(value: number) {
    this._saturation = value;
    this.updateEffectProp("saturation", value, 2);
  }

  set tintColor(value: string) {
    this._tintColor = value;
    this.updateEffectProp("color", value, 3);
  }

  get tintColor(): string {
    return this._tintColor;
  }

  set tintOpacity(value: number) {
    this._tintOpacity = value;
    this.updateEffectProp("alpha", value * 0.22, 3);
  }

  get tintOpacity(): number {
    return this._tintOpacity;
  }

  @computed get invert(): number {
    return this._invert;
  }

  set invert(value: number) {
    this._invert = value;
    this.updateEffectProp("alpha", value, 4);
  }

  @computed get hue(): number {
    return this._hue;
  }

  set hue(value: number) {
    this._hue = value;
    this.updateEffectProp("rotation", value, 5);
  }

  @computed get noise(): number {
    return this._noise;
  }

  set noise(value: number) {
    this._noise = value;
    this.updateEffectProp("noise", value, 6);
  }

  @computed get blur(): number {
    return this._blur;
  }

  set blur(value: number) {
    this._blur = value;
    this.updateEffectProp("blur", value, 7);
  }

  @computed get pixelate(): number {
    return this._pixelate;
  }

  set pixelate(value: number) {
    this._pixelate = value;
    this.updateEffectProp("blocksize", value * 0.2, 8);
  }

  readonly list: Effect[] = [
    {
     name: "brightness",
     defaultValue: 0,
     getValue: () => this.brightness,
     setValue: value => this.brightness = value as number,
     object: new fabric.Image.filters.Brightness({brightness: 0}),
    },
    {
      name: "contrast",
      defaultValue: 0,
      getValue: () => this.contrast,
      setValue: value => this.contrast = value as number,
      object: new fabric.Image.filters.Contrast({contrast: 0}),
    },
    {
      name: "saturation",
      defaultValue: 0,
      getValue: () => this.saturation,
      setValue: value => this.saturation = value as number,
      object: new fabric.Image.filters.Saturation({saturation: 0}),
    },
    {
      name: "tintColor",
      defaultValue: "#000",
      getValue: () => this.tintColor,
      setValue: value => this.tintColor = value as string,
      object: new fabric.Image.filters.BlendColor({
        color: "#000", mode: "tint", alpha: 0,
      }),
    },
    {
      name: "tintOpacity",
      defaultValue: 0,
      getValue: () => this.tintOpacity,
      setValue: value => this.tintOpacity = value as number,
    },
    {
      name: "invert",
      defaultValue: 0,
      getValue: () => this.invert,
      object: new fabric.Image.filters.BlendColor({
        color: "#fff", mode: "exclusion", alpha: 0,
      }),
      setValue: value => this.invert = value as number,
    },
    {
      name: "hue",
      defaultValue: 0,
      getValue: () => this.hue,
      setValue: value => this.hue = value as number,
      object: new (fabric.Image.filters as any).HueRotation({rotation: 0}),
    },
    {
      name: "noise",
      defaultValue: 0,
      getValue: () => this.noise,
      setValue: value => this.noise = value as number,
      object: new fabric.Image.filters.Noise({noise: 0}),
    },
    {
      name: "blur",
      defaultValue: 0,
      getValue: () => this.blur,
      setValue: value => this.blur = value as number,
      object: new (fabric.Image.filters as any).Blur({blur: 0}),
    },
    {
      name: "pixelate",
      defaultValue: 1,
      getValue: () => this.pixelate,
      setValue: value => this.pixelate = value as number,
      object: new fabric.Image.filters.Pixelate({blocksize: 1}),
    },
  ];

  private _savedValues: EffectValue[] = [];

  get savedValues() {
    return this._savedValues;
  }

  set savedValues(value: EffectValue[]) {
    this._savedValues = value;
  }

  constructor(
    private readonly image: ImageStore,
    private readonly canvas: CanvasStore,
  ) {}

  init(): void {
    const filters = this.image?.instance?.filters ?? null;

    if (!filters) {
      return;
    }

    for (let effect of this.list) {
      if (effect.object) {
        filters.push(effect.object);
      }
    }
  }

  resetAll(): void {
    for (let effect of this.list) {
      effect.setValue(effect.defaultValue);
    }
  }

  onSessionStart(): void {
    this.savedValues = this.getValues();
  }

  onSessionEnd(): void {
    const values = this.getValues();

    const shouldSaveEffect = values.map((value, index) => {
      return value !== this.savedValues[index];
    }).includes(true);

    if (shouldSaveEffect) {
      this.canvas.history.push(
        new EffectCommand(this.savedValues, values),
      );
    }
  }

  getValues(): EffectValue[] {
    return this.list.map(effect => effect.getValue());
  }

  setValues(values: EffectValue[]): void {
    for (let i = 0; i < values.length; i++) {
      this.list[i].setValue(values[i]);
    }
  }

  private updateEffectProp(
    propName: string,
    value: EffectValue,
    effectIndex: number,
  ): void {
    const image = this.image.instance as any;
    const effect = image?.filters[effectIndex] ?? null;
    if (effect && image) {
      effect[propName] = value;
      image.applyFilters();
      this.canvas.instance.renderAll();
    }
  }
}
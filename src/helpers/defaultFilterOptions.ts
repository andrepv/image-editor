const defaultFilterOptions: any = {
  BoxBlur: [
    {name: "hRadius", value: 3, minValue: 1, maxValue: 20},
    {name: "vRadius", value: 3, minValue: 1, maxValue: 20},
    {name: "quality", value: 3, minValue: 1, maxValue: 10},
  ],
  StackBlur: [
    {name: "radius", value: 6, minValue: 1, maxValue: 40},
  ],
  BrightnessContrastGimp: [
    {name: "brightness", value: 0, minValue: -100, maxValue: 100},
    {name: "contrast", value: 0, minValue: -100, maxValue: 100},
  ],
  ColorTransformFilter: [
    {name: "redMultiplier", value: 1, hidden: true},
    {name: "greenMultiplier", value: 1, hidden: true},
    {name: "blueMultiplier", value: 1, hidden: true},
    {name: "alphaMultiplier", value: 1, hidden: true},
    {name: "red", value: 0, minValue: -255, maxValue: 255},
    {name: "green", value: 0, minValue: -255, maxValue: 255},
    {name: "blue", value: 0, minValue: -255, maxValue: 255},
    {name: "alphaOffset", value: 0, hidden: true},
  ],
  Dither: [
    {name: "levels", value: 8, minValue: 2, maxValue: 30},
  ],
  HSLAdjustment: [
    {name: "H", value: 0, minValue: -180, maxValue: 100},
    {name: "S", value: 0, minValue: -180, maxValue: 100},
    {name: "L", value: 0, minValue: -180, maxValue: 100},
  ],
  Mosaic: [
    {name: "blockSize", value: 10, minValue: 1, maxValue: 100},
  ],
  Oil: [
    {name: "range", value: 2, minValue: 1, maxValue: 5},
    {name: "levels", value: 32, hidden: true},
  ],
  Posterize: [
    {name: "levels", value: 8, minValue: 2, maxValue: 32},
  ],
  Sharpen: [
    {name: "factor", value: 3, minValue: 1, maxValue: 10},
  ],
};

export default defaultFilterOptions;
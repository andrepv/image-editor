import ImageFilters from "./imagefilters";
const pixelsJS = require("../../node_modules/pixels.js/dist/Pixels.js");

export default function applyFilter(
  imageData: any,
  filterName: string,
  options: any[],
): ImageData {
  const firstTypeFilters = [
    "BoxBlur",
    "ColorTransformFilter",
    "Dither",
    "Emboss",
    "Enrich",
    "HSLAdjustment",
    "BrightnessContrastGimp",
    "StackBlur",
    "Mosaic",
    "Oil",
    "Posterize",
    "Sepia",
    "Sharpen",
  ];
  if (firstTypeFilters.includes(filterName)) {
    if (!options.length) {
      return (ImageFilters as any)[filterName](imageData);
    }
    const optionValues = options.map((option: any) => option.value);
    return (ImageFilters as any)[filterName](imageData, ...optionValues);
  }
  return pixelsJS.filterImgData(imageData, filterName);
}
import React from "react";
import { useObserver } from "mobx-react";
import useStore from "../../helpers/useStore";
import Slider from "../Slider";
import ToggleButton from "../ToggleButton";

const toolbarOptions = [
  {title: "BoxBlur", filterName: "BoxBlur"},
  {title: "StackBlur", filterName: "StackBlur"},
  {title: "Brightness and Contrast", filterName: "BrightnessContrastGimp"},
  {title: "Color Transform", filterName: "ColorTransformFilter"},
  {title: "HSL Adjustment", filterName: "HSLAdjustment"},
  {title: "Mosaic", filterName: "Mosaic"},
  {title: "Oil", filterName: "Oil"},
  {title: "Dither", filterName: "Dither"},
  {title: "Sharpen", filterName: "Sharpen"},
  {title: "Posterize", filterName: "Posterize"},
  {title: "Offset", filterName: "offset_green"},
  {title: "Noise", filterName: "min_noise"},
  {title: "Greyscale", filterName: "greyscale"},
  {title: "Sepia", filterName: "Sepia"},
  {title: "Enrich", filterName: "Enrich"},
  {title: "Emboss", filterName: "Emboss"},
  {title: "Lix", filterName: "lix"},
  {title: "Invert", filterName: "invert"},
  {title: "Diagonal Lines", filterName: "diagonal_lines"},
  {title: "Horizontal Lines", filterName: "horizontal_lines"},
];

export const ToolbarFilters: React.FC = () => {
  const { imageStore } = useStore();
  const isActive = (filterName: string) => {
    return imageStore.filter.name === filterName;
  };

  const renderFilterOptions = () => {
    if (imageStore.filter.options.length) {
      return imageStore.filter.options.map((option: any) => {
        if (option.hidden) {
          return null;
        }
        return (
          <Slider
            title={option.name}
            value={option.value}
            min={option.minValue}
            max={option.maxValue}
            callback={value => {
              imageStore.updateFilterOption(option.name, value);
            }}
          />
        );
      });
    }
    return null;
  };

  return useObserver(() => (
    <div className="toolbar__content">
      <ToggleButton
        title="Normal"
        checked={imageStore.filter.name === ""}
        callback={() => imageStore.addFilter("")}
      />
      {toolbarOptions.map(option => {
        return (
          <>
          <ToggleButton
            title={`${option.title}`}
            checked={isActive(option.filterName)}
            callback={() => imageStore.addFilter(option.filterName)}
          />
          {isActive(option.filterName) ? renderFilterOptions() : null}
          </>
        );
      })}
    </div>
  ));
};

export default ToolbarFilters;
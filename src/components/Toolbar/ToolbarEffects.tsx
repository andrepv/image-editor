import React from "react";
import { useObserver } from "mobx-react";
import Slider from "../Slider";
import useStore from "../../hooks/useStore";
import ColorPicker from "../ColorPicker";
import { hexToRgb } from "../../helpers/colorConverter";

export const ToolbarEffects = () => {
  const {imageStore: image} = useStore();
  return useObserver(() => (
    <div className="toolbar__content">
      <button onClick={() => image.effects.resetAll()}>Reset</button>
      <Slider
        title="Brightness"
        value={`${Math.round(image.effects.brightness * 250)}`}
        min="-100"
        max="100"
        callback={value => image.effects.brightness = value / 250}
      />
      <Slider
        title="Contrast"
        value={`${Math.round(image.effects.contrast * 250)}`}
        min="-100"
        max="100"
        callback={value => image.effects.contrast = value / 250}
      />
      <Slider
        title="Saturation"
        value={`${Math.round(image.effects.saturation * 100)}`}
        min="-100"
        max="100"
        callback={value => image.effects.saturation = value / 100}
      />
      <Slider
        title="Hue Rotate"
        value={`${Math.round(image.effects.hue * 100)}`}
        min="-100"
        max="100"
        callback={value => image.effects.hue = value / 100}
      />
      <Slider
        title="Pixelate"
        value={`${image.effects.pixelate}`}
        min="1"
        max="100"
        callback={value => image.effects.pixelate = value}
      />
      <Slider
        title="Noise"
        value={`${image.effects.noise}`}
        min="0"
        max="100"
        callback={value => image.effects.noise = value}
      />
      <Slider
        title="Invert"
        value={`${Math.round(image.effects.invert * 100)}`}
        min="0"
        max="100"
        callback={value => image.effects.invert = value / 100}
      />
      <Slider
        title="Blur"
        value={`${Math.round(image.effects.blur * 100)}`}
        min="0"
        max="100"
        callback={value => image.effects.blur = value / 100}
      />

      <Slider
        title="Tint"
        value={`${Math.round(image.effects.tintOpacity * 100)}`}
        min="0"
        max="100"
        callback={value => image.effects.tintOpacity = value / 100}
      />
      <ColorPicker
        currentColorCode={hexToRgb(image.effects.tintColor) as string}
        callback={hex => {
          image.effects.tintColor = hex;
          image.effects.tintOpacity = 1;
        }}
        output="hex"
      />
  </div>
  ));
};

export default ToolbarEffects;
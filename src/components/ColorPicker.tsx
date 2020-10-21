import React, { useState } from "react";
import { hexToRgb, rgbToHex } from "../helpers/colorConverter";

type Props = {
  title?: string;
  currentColorCode: string;
  output?: "rgb" | "hex";
  callback: (value: string) => void;
}

const ColorPicker: React.FC<Props> = props => {
  const {currentColorCode, callback, title, output} = props;
  const [rgbCodes, setRgbCodes] = useState([
    "255,255,255",
    "177,177,177",
    "61,61,61",
    "255,101,101",
    "255,189,90",
    "255,250,101",
    "211,255,107",
    "138,212,255",
    "119,123,255",
    "255,154,245",
    "0,255,159",
    "233,99,233",
  ]);

  const updateColor = (
    event: React.ChangeEvent<HTMLInputElement>,
    elIndex: number,
  ) => {
    const hex = event.target.value;
    const rgb = hexToRgb(hex);

    if (!rgb) {
      return;
    }

    const newRgbCodes = [...rgbCodes];
    newRgbCodes[elIndex] = rgb;
    callback(output === "hex" ? hex : rgb);
    setRgbCodes(newRgbCodes);
  };

  return (
    <div className="toolbar__block">
      {title && <p className="toolbar__block-title">{title}</p>}
      <div className="colors__grid">
        {rgbCodes.map((rgbCode, index) => {
          const [r, g, b] = rgbCode.split(",").map(item => Number(item));
          const hexColorCode = rgbToHex(r, g, b);
          return (
            <input
              key={index}
              type="color"
              value={`${hexColorCode}`}
              onChange={event => updateColor(event, index)}
              onClick={() => (
                callback(output === "hex" ? hexColorCode : rgbCode)
              )}
              className={`colors__color ${
                rgbCode === currentColorCode ? "colors__color_active" : ""
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorPicker;
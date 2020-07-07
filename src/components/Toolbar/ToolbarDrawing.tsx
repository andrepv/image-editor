import React, { useState } from "react";
import useStore from "../../helpers/useStore";
import { useObserver } from "mobx-react";
import { rgbToHex, hexToRgb } from "../../helpers/colorConverter";

const MAX_LINE_WIDTH = 150;
const MIN_LINE_WIDTH = 1;

const ToolbarDrawing: React.FC = () => {
  const { drawingStore } = useStore();
  const [lineOpacity, setLineOpacity] = useState(
    drawingStore.opacity * 100,
  );
  const [rgbCodes, setRgbCodes] = useState([
    "255, 255, 255",
    "177, 177, 177",
    "61, 61, 61",
    "255, 101, 101",
    "255, 189, 90",
    "255, 250, 101",
    "211, 255, 107",
    "138, 212, 255",
    "119, 123, 255",
    "255, 154, 245",
    "0, 255, 159",
    "233, 99, 233",
  ]);

  const updateLineWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(String(event.target.value), 10);
    value = Math.max(value, MIN_LINE_WIDTH);
    value = Math.min(value, MAX_LINE_WIDTH);
    drawingStore.setLineWidth(value);
  };

  const updateLineOpacity = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(String(event.target.value), 10);
    value = Math.max(value, 0);
    value = Math.min(value, 100);
    setLineOpacity(value);
    drawingStore.setOpacity(value / 100);
  };

  const updateColor = (
    event: React.ChangeEvent<HTMLInputElement>,
    elIndex: number,
  ) => {
    const color = hexToRgb(event.target.value);
    if (!color) {
      return;
    }
    const newRgbCodes = [...rgbCodes];
    newRgbCodes[elIndex] = color;
    drawingStore.setColorCode(color);
    setRgbCodes(newRgbCodes);
  };

  return useObserver(() => (
    <div className="toolbar__content">
       <div>
          <p className="toolbar__section-title">Colors</p>
          <div className="toolbar__option toolbar__colors">
            {rgbCodes.map((rgbCode: string, index: number) => {
              const [r, g, b] = rgbCode.split(",").map(item => Number(item));
              const hexColorCode = rgbToHex(r, g, b);
              return (
                <input
                  key={index}
                  type="color"
                  className={`toolbar__color ${
                    rgbCode === drawingStore.colorCode
                      ? "toolbar__color_active" : ""
                  }`}
                  value={`${hexColorCode}`}
                  onChange={event => updateColor(event, index)}
                  onClick={() => drawingStore.setColorCode(rgbCode)}
                />
              );
            })}
          </div>
        </div>
        <div>
          <p className="toolbar__section-title">Width</p>
          <div className="toolbar__option">
            <input
              type="range"
              value={`${drawingStore.lineWidth}`}
              min={`${MIN_LINE_WIDTH}`}
              max={`${MAX_LINE_WIDTH}`}
              onChange={updateLineWidth}
              className="toolbar__slider"
            />
            <input
              type="number"
              value={`${drawingStore.lineWidth}`}
              onChange={updateLineWidth}
              min={`${MIN_LINE_WIDTH}`}
              max={`${MAX_LINE_WIDTH}`}
              className="toolbar__slider"
            />
          </div>
        </div>

        <div>
          <p className="toolbar__section-title">Opacity</p>
          <div className="toolbar__option">
            <input
              type="range"
              value={`${lineOpacity}`}
              min="0"
              max="100"
              onChange={updateLineOpacity}
              className="toolbar__slider"
            ></input>
            <input
              type="number"
              value={`${lineOpacity}`}
              onChange={updateLineOpacity}
              min="0"
              max="100"
              className="toolbar__slider"
            />
          </div>
        </div>

        <div>
          <p className="toolbar__section-title">Straight Line</p>
          <div className="toolbar__option">
            <input
              type="checkbox"
              checked={drawingStore.isLineStraight}
              onChange={() => drawingStore.toggleFreeDrawingMode()}
            />
          </div>
        </div>
    </div>
  ));
};

export default ToolbarDrawing;
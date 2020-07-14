import React from "react";
import { useObserver } from "mobx-react";
import Slider from "../Slider";
import ColorPicker from "../ColorPicker";
import useStore from "../../helpers/useStore";
import ToggleButton from "../ToggleButton";

const ToolbarDrawing: React.FC = () => {
  const { drawingStore } = useStore();
  return useObserver(() => (
    <div className="toolbar__content">
      <ColorPicker
        title="Colors"
        currentColorCode={drawingStore.colorCode}
        callback={rgbCode => drawingStore.setColorCode(rgbCode)}
      />
      <Slider
        title="Width"
        value={`${drawingStore.lineWidth}`}
        min="1"
        max="150"
        callback={value => drawingStore.setLineWidth(value)}
      />
      <Slider
        title="Opacity"
        value={`${Math.round(drawingStore.opacity * 100)}`}
        min="0"
        max="100"
        callback={value => drawingStore.setOpacity(value / 100)}
      />
      <ToggleButton
        title="Straight Line"
        checked={drawingStore.isLineStraight}
        callback={() => drawingStore.toggleFreeDrawingMode()}
      />
    </div>
  ));
};

export default ToolbarDrawing;
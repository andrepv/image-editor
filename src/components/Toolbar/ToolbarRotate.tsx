import React from "react";
import useStore from "../../hooks/useStore";
import "rc-slider/assets/index.css";

import { ReactComponent as Left } from "../../assets/left.svg";
import { ReactComponent as Right } from "../../assets/right.svg";
import { ReactComponent as FlipX } from "../../assets/flipX.svg";
import { ReactComponent as FlipY } from "../../assets/flipY.svg";
import Slider from "../Slider";
import { useObserver } from "mobx-react";

const ToolbarRotate: React.FC = () => {
  const { canvasStore } = useStore();
  return useObserver(() => (
    <>
    <div className="toolbar__content">
      <div className="toolbar__options toolbar__options_one-col">

        <div
          className={`toolbar__option ${
            canvasStore.flipX ? "toolbar__option_active" : ""
          }`}
          onClick={() => canvasStore.setFlipX(!canvasStore.flipX)}
        >
          <FlipX /> <p> Flip X</p>
        </div>

        <div
          className={`toolbar__option ${
            canvasStore.flipY ? "toolbar__option_active" : ""
          }`}
          onClick={() => canvasStore.setFlipY(!canvasStore.flipY)}
        >
          <FlipY /> <p> Flip Y</p>
        </div>

        <div className="toolbar__option" onClick={() => {
          canvasStore.rotateLeft();
        }}>
          <Left /> <p> Rotate Left</p>
        </div>

        <div className="toolbar__option" onClick={() => {
          canvasStore.rotateRight();
        }}>
          <Right /> <p> Rotate Right</p>
        </div>
      </div>
      <Slider
        title="Angle"
        value={canvasStore.angle}
        min={-360}
        max={360}
        startPoint={0}
        marks={{
          360: "360°",
          0: "0°",
          "-360": "-360°",
          180: "180°",
          "-180": "-180°",
        }}
        callback={value => canvasStore.rotate(value)}
      />
    </div>
    </>
  ));
};

export default ToolbarRotate;
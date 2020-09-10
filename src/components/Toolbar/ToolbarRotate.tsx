import React from "react";
import useStore from "../../hooks/useStore";
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
      <div className="toolbar__options">
        <div className="toolbar__option" onClick={() => {
          canvasStore.rotateLeft();
        }}>
          <Left />
          <p className="toolbar__option-title">Rotate left</p>
        </div>
        <div className="toolbar__option" onClick={() => {
          canvasStore.rotateRight();
        }}>
          <Right />
          <p className="toolbar__option-title">Rotate right</p>
        </div>
        <div className="toolbar__option" onClick={() => {
          canvasStore.setFlipX(!canvasStore.flipX);
        }}>
          <FlipX />
          <p className="toolbar__option-title">Flip X</p>
        </div>
        <div className="toolbar__option" onClick={() => {
          canvasStore.setFlipY(!canvasStore.flipY);
        }}>
          <FlipY />
          <p className="toolbar__option-title">Flip Y</p>
        </div>
      </div>
        <Slider
          title="Angle"
          value={`${canvasStore.angle}`}
          min="-360"
          max="360"
          callback={value => {
            canvasStore.rotate(value);
          }}
        />
    </div>
    </>
  ));
};

export default ToolbarRotate;
import React from "react";
import useStore from "../helpers/useStore";
import { ReactComponent as Left } from "../assets/left.svg";
import { ReactComponent as Right } from "../assets/right.svg";
import { ReactComponent as FlipX } from "../assets/flipX.svg";
import { ReactComponent as FlipY } from "../assets/flipY.svg";

const ToolbarRotate: React.FC = () => {
  const { imageStore } = useStore();
  return (
    <>
    <div className="toolbar__content">
      <div className="toolbar__options">
        <div className="toolbar__option" onClick={() => {
          imageStore.rotateLeft();
        }}>
          <Left />
          <p className="toolbar__option-title">Rotate left</p>
        </div>
        <div className="toolbar__option" onClick={() => {
          imageStore.rotateRight();
        }}>
          <Right />
          <p className="toolbar__option-title">Rotate right</p>
        </div>
        <div className="toolbar__option" onClick={() => {
          imageStore.toggleFlipX();
        }}>
          <FlipX />
          <p className="toolbar__option-title">Flip X</p>
        </div>
        <div className="toolbar__option" onClick={() => {
          imageStore.toggleFlipY();
        }}>
          <FlipY />
          <p className="toolbar__option-title">Flip Y</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default ToolbarRotate;
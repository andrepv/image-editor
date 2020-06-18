import React from "react";
import useStore from "../helpers/useStore";

import Tooltip from "./Tooltip";
import { ReactComponent as Plus } from "../assets/plus.svg";
import { ReactComponent as Minus } from "../assets/minus.svg";
import { useObserver } from "mobx-react";

const ZoomControl: React.FC = () => {
  const { canvasStore } = useStore();
  return useObserver(() => (canvasStore.imageUrl && !canvasStore.mode) ? (
    <div className="zoom">
      <button className="zoom-in" onClick={() => {
        canvasStore.increaseScale();
      }}>
        <Tooltip content="Zoom In" placement="top">
          <Plus/>
        </Tooltip>
      </button>
      <p>{`${Math.floor(canvasStore.scale * 100)}%`}</p>
      <button className="zoom-out" onClick={() => {
        canvasStore.decreaseScale();
      }}>
        <Tooltip content="Zoom Out" placement="top">
          <Minus />
        </Tooltip>
      </button>
    </div>
  ) : null);
};

export default ZoomControl;
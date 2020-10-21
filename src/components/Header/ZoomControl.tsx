import React from "react";
import useStore from "../../hooks/useStore";

import Tooltip from "../Tooltip";
import { ReactComponent as Plus } from "../../assets/plus.svg";
import { ReactComponent as Minus } from "../../assets/minus.svg";
import { useObserver } from "mobx-react";

const ZoomControl: React.FC = () => {
  const { canvasStore, imageStore } = useStore();
  return useObserver(() => (imageStore.url && !canvasStore.mode) ? (
    <div className="zoom-control">
      <button className="zoom-control__zoom-in" onClick={() => {
        canvasStore.increaseScale();
      }}>
        <Tooltip content="Zoom In" placement="top">
          <Plus/>
        </Tooltip>
      </button>
      <p className="zoom-control__value">
        {`${Math.floor(canvasStore.scale * 100)}%`}
      </p>
      <button className="zoom-control__zoom-out" onClick={() => {
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
import React from "react";
import useStore from "../helpers/useStore";

import Tooltip from "./Tooltip";
import { ReactComponent as Plus } from "../assets/plus.svg";
import { ReactComponent as Minus } from "../assets/minus.svg";
import { useObserver } from "mobx-react";

const ZoomControl: React.FC = () => {
  const { canvasStore, imageStore } = useStore();
  return useObserver(() => (imageStore.url && !canvasStore.mode) ? (
    <div className="zoom">
      <button className="zoom-in" onClick={() => {
        imageStore.increaseScale();
      }}>
        <Tooltip content="Zoom In" placement="top">
          <Plus/>
        </Tooltip>
      </button>
      <p>{`${Math.floor(imageStore.scale * 100)}%`}</p>
      <button className="zoom-out" onClick={() => {
        imageStore.decreaseScale();
      }}>
        <Tooltip content="Zoom Out" placement="top">
          <Minus />
        </Tooltip>
      </button>
    </div>
  ) : null);
};

export default ZoomControl;
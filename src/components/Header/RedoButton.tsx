import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { commandHistory } from "../../command/commandHistory";
import { ReactComponent as Redo } from "../../assets/redo.svg";

export const RedoButton = () => {
  const {canvasStore, imageStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Redo" placement="bottom">
        <Redo
          className={`${
            !canvasStore.isRedoCommandAvailable ? "disabled" : ""
          }`}
          onClick={() => {
            imageStore.resetScale();
            commandHistory.redo();
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default RedoButton;
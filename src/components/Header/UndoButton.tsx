import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { commandHistory } from "../../command/commandHistory";
import { ReactComponent as Undo } from "../../assets/redo.svg";

export const UndoButton = () => {
  const {canvasStore, imageStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Undo" placement="bottom">
        <Undo
          className={`${
            !canvasStore.isUndoCommandAvailable ? "disabled" : ""
          }`}
          onClick={() => {
            imageStore.resetScale();
            commandHistory.undo();
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default UndoButton;
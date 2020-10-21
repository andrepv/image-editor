import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { ReactComponent as Undo } from "../../assets/undo.svg";

export const UndoButton = () => {
  const {UIStore, canvasStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Undo" placement="bottom">
        <Undo
          className={`${!UIStore.canUndo ? "disabled" : ""}`}
          onClick={() => {
            if (!UIStore.canUndo) {
              return;
            }
            canvasStore.history.undo();
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default UndoButton;
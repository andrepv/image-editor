import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { ReactComponent as Undo } from "../../assets/redo.svg";

export const UndoButton = () => {
  const {UIStore, canvasStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Undo" placement="bottom">
        <Undo
          className={`${!UIStore.canUndo ? "disabled" : ""}`}
          onClick={async () => {
            if (!UIStore.canUndo) {
              return;
            }
            canvasStore.history.isHistoryCommandExecuted = true;
            await canvasStore.history.undo();
            canvasStore.history.isHistoryCommandExecuted = false;
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default UndoButton;
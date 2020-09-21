import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { ReactComponent as Redo } from "../../assets/redo.svg";

export const RedoButton = () => {
  const {UIStore, canvasStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Redo" placement="bottom">
        <Redo
          className={`${!UIStore.canRedo ? "disabled" : ""}`}
          onClick={async () => {
            if (!UIStore.canRedo) {
              return;
            }
            canvasStore.history.isHistoryCommandExecuted = true;
            await canvasStore.history.redo();
            canvasStore.history.isHistoryCommandExecuted = false;
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default RedoButton;
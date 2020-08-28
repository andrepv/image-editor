import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { history } from "../../command/commandHistory";
import { ReactComponent as Undo } from "../../assets/redo.svg";

export const UndoButton = () => {
  const {appStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Undo" placement="bottom">
        <Undo
          className={`${!appStore.canUndo ? "disabled" : ""}`}
          onClick={async () => {
            if (!appStore.canUndo) {
              return;
            }
            appStore.isHistoryCommandExecuted = true;
            await history.undo();
            appStore.isHistoryCommandExecuted = false;
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default UndoButton;
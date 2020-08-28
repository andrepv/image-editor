import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";
import { history } from "../../command/commandHistory";
import { ReactComponent as Redo } from "../../assets/redo.svg";

export const RedoButton = () => {
  const {appStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Redo" placement="bottom">
        <Redo
          className={`${!appStore.canRedo ? "disabled" : ""}`}
          onClick={async () => {
            if (!appStore.canRedo) {
              return;
            }
            appStore.isHistoryCommandExecuted = true;
            await history.redo();
            appStore.isHistoryCommandExecuted = false;
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default RedoButton;
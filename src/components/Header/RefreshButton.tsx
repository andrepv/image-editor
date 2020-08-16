import React from "react";
import { useObserver } from "mobx-react";
import Tooltip from "../Tooltip";
import { ReactComponent as Refresh } from "../../assets/refresh.svg";
import useStore from "../../hooks/useStore";
import { commandHistory } from "../../command/commandHistory";

export const RefreshButton = () => {
  const {canvasStore, imageStore, searchStore, appStore} = useStore();
  return useObserver(() => (
    <div>
      <Tooltip content="Refresh" placement="bottom">
        <Refresh
          className={`${!imageStore.url ? "disabled" : ""}`}
          onClick={() => {
            if (!imageStore.url) {
              return;
            }
            appStore.closeToolbar();
            canvasStore.setMode("");
            commandHistory.clearHistory();
            imageStore.loadImage(searchStore.selectedImageUrl);
          }}
        />
      </Tooltip>
    </div>
  ));
};

export default RefreshButton;
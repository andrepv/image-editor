import React from "react";
import Tooltip from "../Tooltip";
import { ReactComponent as Refresh } from "../../assets/refresh.svg";
import useStore from "../../hooks/useStore";
import { commandHistory } from "../../command/commandHistory";

export const RefreshButton = () => {
  const {canvasStore, imageStore, searchStore, toolbarStore} = useStore();
  return (
    <div>
      <Tooltip content="Refresh" placement="bottom">
        <Refresh onClick={() => {
          toolbarStore.close();
          canvasStore.setMode("");
          commandHistory.clearHistory();
          imageStore.loadImage(searchStore.selectedImageUrl);
        }}/>
      </Tooltip>
    </div>
  );
};

export default RefreshButton;
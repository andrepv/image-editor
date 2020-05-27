import React from "react";

import { ReactComponent as Save } from "../assets/save.svg";
import Tooltip from "./Tooltip";
import useStore from "../helpers/useStore";

const SaveButton: React.FC = () => {
  const { canvasStore } = useStore();
  const saveImage = () => {
    if (!canvasStore.canvasElement) {
      return;
    }
    const randomNum = Math.floor(Math.random() * 1000);
    const fileName = `image-${randomNum}.png`;
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvasStore.canvasElement.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();
  };

  return (
    <Tooltip content="Save" placement="bottom">
      <Save onClick={saveImage}/>
    </Tooltip>
  );
};
export default SaveButton;
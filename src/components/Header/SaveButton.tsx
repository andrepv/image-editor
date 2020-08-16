import React from "react";
import { useObserver } from "mobx-react";

import { ReactComponent as Save } from "../../assets/save.svg";
import Tooltip from "../Tooltip";
import useStore from "../../hooks/useStore";

const SaveButton: React.FC = () => {
  const { imageStore } = useStore();
  const saveImage = async () => {
    if (!imageStore.url) {
      return;
    }
    const randomNum = Math.floor(Math.random() * 1000);
    const fileName = `image-${randomNum}.png`;
    const link = document.createElement("a");
    link.download = fileName;
    link.href = await imageStore.getDataUrl();

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();
  };

  return useObserver(() => (
    <Tooltip content="Save" placement="bottom">
      <Save
        className={`${!imageStore.url ? "disabled" : ""}`}
        onClick={saveImage}
      />
    </Tooltip>
  ));
};
export default SaveButton;
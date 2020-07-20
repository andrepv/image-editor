import React from "react";
import ToolbarCrop from "./ToolbarCrop";
import ToolbarRotate from "./ToolbarRotate";
import ToolbarDrawing from "./ToolbarDrawing";
import ToolbarText from "./ToolbarText";
import useStore from "../../helpers/useStore";
import { ReactComponent as Close } from "../../assets/close.svg";
import { useObserver } from "mobx-react";
import ToolbarFilters from "./ToolbarFilters";

const Toolbar: React.FC = () => {
  const { toolbarStore, canvasStore } = useStore();
  const contentMap: any = {
    Crop: <ToolbarCrop />,
    Rotate: <ToolbarRotate />,
    Draw: <ToolbarDrawing />,
    Text: <ToolbarText />,
    Filters: <ToolbarFilters />,
  };
  const close = () => {
    toolbarStore.close();
    canvasStore.setMode("");
  };

  return useObserver(() => (
    <section className="toolbar">
      <div className="toolbar__header">
        <h3 className="toolbar__title">{toolbarStore.type}</h3>
        <Close onClick={close}/>
      </div>
      {contentMap[toolbarStore.type]}
    </section>
  ));
};

export default Toolbar;
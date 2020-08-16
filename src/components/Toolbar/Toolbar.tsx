import React from "react";
import ToolbarCrop from "./ToolbarCrop";
import ToolbarRotate from "./ToolbarRotate";
import ToolbarDrawing from "./ToolbarDrawing";
import ToolbarText from "./ToolbarText";
import useStore from "../../hooks/useStore";
import { ReactComponent as Close } from "../../assets/close.svg";
import { useObserver } from "mobx-react";
import ToolbarFilters from "./ToolbarFilters";
import ToolbarSearch from "./ToolbarSearch";

const Toolbar: React.FC = () => {
  const { appStore, canvasStore } = useStore();
  const contentMap: any = {
    Search: <ToolbarSearch />,
    Crop: <ToolbarCrop />,
    Rotate: <ToolbarRotate />,
    Draw: <ToolbarDrawing />,
    Text: <ToolbarText />,
    Filters: <ToolbarFilters />,
  };
  const close = () => {
    appStore.closeToolbar();
    canvasStore.setMode("");
  };

  return useObserver(() => (
    <section className={`toolbar ${
      appStore.type === "Search" ? "toolbar_search" : ""
      }`}>
      <div className="toolbar__header">
        <h3 className="toolbar__title">{appStore.type}</h3>
        <Close onClick={close}/>
      </div>
      {contentMap[appStore.type]}
    </section>
  ));
};

export default Toolbar;
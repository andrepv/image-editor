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
    search: <ToolbarSearch />,
    crop: <ToolbarCrop />,
    rotate: <ToolbarRotate />,
    drawing: <ToolbarDrawing />,
    text: <ToolbarText />,
    filters: <ToolbarFilters />,
  };

  return useObserver(() => (
    <section className={`toolbar ${
      canvasStore.mode === "search" ? "toolbar_search" : ""
      }`}>
      <div className="toolbar__header">
        <h3 className="toolbar__title">{canvasStore.mode}</h3>
        <Close onClick={() => {
          canvasStore.resetToBaseScale();
          appStore.closeToolbar();
        }}/>
      </div>
      {contentMap[canvasStore.mode]}
    </section>
  ));
};

export default Toolbar;
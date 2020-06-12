import React from "react";
import { useObserver } from "mobx-react";
import useStore from "../helpers/useStore";
import { ReactComponent as Close } from "../assets/close.svg";

const Toolbar: React.FC = () => {
  return (
    <section className="toolbar">
      <ToolbarCrop />
    </section>
  );
};

const ToolbarCrop: React.FC = () => {
  const { toolbarStore } = useStore();
  return useObserver(() => (
    <>
    <div className="toolbar__header">
        <h3 className="toolbar__title">{toolbarStore.type}</h3>
        <Close onClick={() => toolbarStore.close()}/>
      </div>
      <div className="toolbar__content">
        <div className="toolbar__form">
          <p className="toolbar__label">Width</p>
          <input
            type="number"
            className="toolbar__input"
          />
          <p className="toolbar__label">Height</p>
          <input
            type="number"
            className="toolbar__input"
          />
        </div>
    </div>
    </>
  ));
}

export default Toolbar;
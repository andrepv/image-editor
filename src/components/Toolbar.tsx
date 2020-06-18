import React from "react";
import { useObserver } from "mobx-react";
import useStore from "../helpers/useStore";
import { ReactComponent as Close } from "../assets/close.svg";
import { ReactComponent as Crop } from "../assets/crop.svg";

const Toolbar: React.FC = () => {
  return (
    <section className="toolbar">
      <ToolbarCrop />
    </section>
  );
};

const ToolbarCrop: React.FC = () => {
  const { toolbarStore, canvasStore, cropperStore } = useStore();

  const close = () => {
    toolbarStore.close();
    canvasStore.setMode("");
  };

  const aspectRatioList = [
    {name: "custom", value: null},
    {name: "1:1", value: {width: 1, height: 1}},
    {name: "3:2", value: {width: 3, height: 2}},
    {name: "4:3", value: {width: 4, height: 3}},
    {name: "5:4", value: {width: 5, height: 4}},
    {name: "7:5", value: {width: 7, height: 5}},
    {name: "16:9", value: {width: 16, height: 9}},
  ];

  return useObserver(() => (
    <>
    <div className="toolbar__header">
        <h3 className="toolbar__title">Crop</h3>
        <Close onClick={close}/>
      </div>
      <div className="toolbar__content">
        <div className="toolbar__options">
          {aspectRatioList.map((aspectRatio: any, index: number) => {
            return (
              <div
                key={index}
                className={`toolbar__option ${
                  cropperStore.ratioName === aspectRatio.name
                    ? "toolbar__option_active"
                    : ""
                }`}
                onClick={() => cropperStore.setRatio(aspectRatio)}
              >
                <Crop />
                <p className="toolbar__option-title">{aspectRatio.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  ));
};

export default Toolbar;
import React, { useState, ChangeEvent, useEffect } from "react";
import { autorun } from "mobx";
import { useObserver } from "mobx-react";
import useStore from "../../hooks/useStore";
import { ReactComponent as Crop } from "../../assets/crop.svg";

const ToolbarCrop: React.FC = () => {
  const { cropperStore, canvasStore, toolbarStore } = useStore();
  const [width, setWidth] = useState(cropperStore.cropZoneWidth);
  const [height, setHeight] = useState(cropperStore.cropZoneHeight);

  const updateWidth = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || width;
    setWidth(value);
  };

  const updateHeight = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || height;
    setHeight(value);
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

  useEffect(() => {
    autorun(() => {
      setWidth(cropperStore.widthIndicator);
      setHeight(cropperStore.heightIndicator);
    });
  }, []);

  return useObserver(() => (
      <div className="toolbar__content">
        <div className="toolbar__form">
          <p className="toolbar__label">Width</p>
          <input
            type="number"
            className="toolbar__input"
            value={Math.floor(width)}
            onChange={updateWidth}
            onBlur={() => cropperStore.changeCropZoneWidth(width)}
            min={0}
          />
          <p className="toolbar__label">Height</p>
          <input
            type="number"
            className="toolbar__input"
            value={Math.floor(height)}
            onChange={updateHeight}
            onBlur={() => cropperStore.changeCropZoneHeight(height)}
            min={0}
          />
        </div>
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
        <button
          className="toolbar__crop-btn"
          onClick={() => {
            cropperStore.crop(true);
            canvasStore.setMode("");
            toolbarStore.close();
          }}
        >
          Crop
        </button>
      </div>
  ));
};

export default ToolbarCrop;
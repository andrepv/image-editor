import React, { ChangeEvent, useEffect, useState } from "react";
import { useObserver } from "mobx-react";
import useStore from "../../hooks/useStore";
import { autorun } from "mobx";

const ToolbarCrop: React.FC = () => {
  const { cropperStore: cropper, UIStore } = useStore();
  const [ratio, setRatio] = useState("custom");
  const [cropZoneWidth, setCropZoneWidth] = useState(0);
  const [cropZoneHeight, setCropZoneHeight] = useState(0);

  const updateCropZoneWidth = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setCropZoneWidth(value);
    cropper.setCropZoneWidth(value);
  };

  const updateCropZoneHeight = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setCropZoneHeight(value);
    cropper.setCropZoneHeight(value);
  };

  const aspectRatioList = [
    {name: "custom", value: null},
    {name: "1:1", value: {width: 1, height: 1}},
    {name: "3:2", value: {width: 3, height: 2}},
    {name: "4:3", value: {width: 4, height: 3}},
    {name: "5:4", value: {width: 5, height: 4}},
    {name: "7:5", value: {width: 7, height: 5}},
    {name: "14:9", value: {width: 14, height: 9}},
    {name: "16:9", value: {width: 16, height: 9}},
  ];

  useEffect(() => {
    autorun(() => {
      const {
        cropZoneWidth: width,
        cropZoneHeight: height,
        activeInputName,
      } = cropper;
      if (!activeInputName) {
        setCropZoneWidth(width);
        setCropZoneHeight(height);
      } else if (activeInputName === "width") {
        setCropZoneHeight(height);
      } else if (activeInputName === "height") {
        setCropZoneWidth(width);
      }
    });
  }, []);

  return useObserver(() => (
      <div className="toolbar__content">
        <div className="toolbar__form">
          <p className="toolbar__form-label">Width</p>
          <input
            type="number"
            className="toolbar__form-input"
            value={Math.floor(cropZoneWidth)}
            min={0}
            onChange={updateCropZoneWidth}
            onFocus={() => cropper.activeInputName = "width"}
            onBlur={() => {
              cropper.activeInputName = "";
              setCropZoneWidth(cropper.cropZoneWidth);
            }}
          />
          <p className="toolbar__form-label">Height</p>
          <input
            type="number"
            className="toolbar__form-input"
            value={Math.floor(cropZoneHeight)}
            min={0}
            onChange={updateCropZoneHeight}
            onFocus={() => cropper.activeInputName = "height"}
            onBlur={() => {
              cropper.activeInputName = "";
              setCropZoneHeight(cropper.cropZoneHeight);
            }}
          />
        </div>

        <div className="toolbar__block">
          <div className="toolbar__divider"></div>
          <p className="toolbar__block-title">Aspect Ratio</p>
          <div className="toolbar__options">
            {aspectRatioList.map((aspectRatio, index) => {
              return (
                <div
                  key={index}
                  className={`toolbar__option ${
                    ratio === aspectRatio.name
                      ? "toolbar__option_active"
                      : ""
                  }`}
                  onClick={() => {
                    setRatio(aspectRatio.name);
                    cropper.setRatio(aspectRatio.value);
                  }}
                >
                  {aspectRatio.name}
                </div>
              );
            })}
          </div>
        </div>
        <button
          className="toolbar__action-btn"
          onClick={() => {
            cropper.crop();
            UIStore.closeToolbar();
          }}
        >
          Apply
        </button>
      </div>
  ));
};

export default ToolbarCrop;
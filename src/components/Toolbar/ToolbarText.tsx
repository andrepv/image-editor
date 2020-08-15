import React from "react";
import { useObserver } from "mobx-react";
import { ReactComponent as Bold } from "../../assets/bold.svg";
import { ReactComponent as Underline } from "../../assets/underline.svg";
import { ReactComponent as Italic } from "../../assets/italic.svg";
import { ReactComponent as AlignLeft } from "../../assets/align-left.svg";
import { ReactComponent as AlignCenter } from "../../assets/align-center.svg";
import { ReactComponent as AlignRight } from "../../assets/align-right.svg";
import {ReactComponent as Trash } from "../../assets/trash.svg";
import Slider from "../Slider";
import ColorPicker from "../ColorPicker";
import ToggleButton from "../ToggleButton";
import useStore from "../../hooks/useStore";
import { TextСonstants } from "../../stores/textStore";

const ToolbarText: React.FC = () => {
  const { textStore } = useStore();
  const options = [
    {
      icon:  <Bold />,
      name: "fontWeight",
      handler: () => textStore.toggleFontWeight(),
      isActive: (fontWeight: string) => fontWeight === "bold",
    },
    {
      icon:  <Underline />,
      name: "underline",
      handler: () => textStore.toggleTextDecoration(),
      isActive: (isUnderlined: any) => isUnderlined,
    },
    {
      icon:  <Italic />,
      name: "fontStyle",
      handler: () => textStore.toggleFontStyle(),
      isActive: (fontStyle: string) => fontStyle === "italic",
    },
    {
      icon:  <AlignLeft />,
      name: "textAlign",
      handler: () => textStore.setTextAlign("left"),
      isActive: (textAlign: string) => textAlign === "left",
    },
    {
      icon:  <AlignCenter />,
      name: "textAlign",
      handler: () => textStore.setTextAlign("center"),
      isActive: (textAlign: string) => textAlign === "center",
    },
    {
      icon:  <AlignRight />,
      name: "textAlign",
      handler: () => textStore.setTextAlign("right"),
      isActive: (textAlign: string) => textAlign === "right",
    },
  ];
  return useObserver(() => (
    <div className="toolbar__content">
      <button
        onClick={() => textStore.addText()}
        className="toolbar__block"
      >
        Add Text
      </button>
      {textStore.isTextControlHidden ? (
        <>
        <div className="toolbar__options toolbar__options_text toolbar__block">
          {options.map((option, index) => {
            const optionValue = (textStore as any)[option.name];
            return (
              <div
                key={index}
                className={`toolbar__option ${
                  option.isActive(optionValue) ? "toolbar__option_active" : ""
                }`}
                onClick={option.handler}
              >
                {option.icon}
              </div>
            );
          })}
        </div>
        <Slider
          title="Size"
          value={`${Math.floor(textStore.fontSizeIndicator)}`}
          min={`${TextСonstants.MIN_FONT_SIZE}`}
          max={`${TextСonstants.MAX_FONT_SIZE}`}
          callback={value => {
            textStore.setFontSize(value);
            textStore.updateFontSizeIndicator(value);
          }}
        />
        <Slider
          title="Line height"
          value={`${textStore.lineHeight}`}
          min={`${TextСonstants.MIN_LINE_HEIGHT}`}
          max={`${TextСonstants.MAX_LINE_HEIGHT}`}
          callback={value => textStore.setLineHeight(value)}
        />
        <ColorPicker
          title="Colors"
          currentColorCode={textStore.fontColorCode}
          callback={rgbCode => textStore.setFontColor(rgbCode)}
        />
        <ToggleButton
          title="Background"
          checked={!textStore.isBackgroundTransparent}
          callback={() => textStore.toggleBackgroundTransparency()}
        />
        {!textStore.isBackgroundTransparent && (
          <ColorPicker
            currentColorCode={textStore.backgroundColorCode}
            callback={rgbCode => textStore.setBackgroundColor(rgbCode)}
          />
        )}
        <p onClick={() => textStore.removeText()}>Remove <Trash/></p>
        </>
      ) : null}
    </div>
  ));
};

export default ToolbarText;
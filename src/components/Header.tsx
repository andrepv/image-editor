import React from "react";
import { ReactComponent as Refresh } from "../assets/refresh.svg";
import { ReactComponent as Undo } from "../assets/undo.svg";
import { ReactComponent as Redo } from "../assets/redo.svg";
import UploadButton from "./UploadButton";
import SaveButton from "./SaveButton";

import Tooltip from "./Tooltip";

const Header: React.FC = () => {
  const buttons = [
    <Tooltip content="Refresh" placement="bottom"><Refresh /></Tooltip>,
    <Tooltip content="Undo" placement="bottom"><Undo /></Tooltip>,
    <Tooltip content="Redo" placement="bottom"><Redo /></Tooltip>,
    <UploadButton />,
    <SaveButton />,
  ];
  return (
    <header className="header">
      <div className="header__items">
        {buttons.map((button, index) => {
          return (
            <React.Fragment key={index}>
              <div className="header__item">
                {button}
              </div>
              {index === 2 && <div className="separator"></div>}
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
};

export default Header;
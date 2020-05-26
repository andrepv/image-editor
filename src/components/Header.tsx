import React from "react";

import { ReactComponent as Refresh } from "../assets/refresh.svg";
import { ReactComponent as Undo } from "../assets/undo.svg";
import { ReactComponent as Redo } from "../assets/redo.svg";
import { ReactComponent as Save } from "../assets/save.svg";
import SearchButton from "./SearchButton";
import UploadButton from "./UploadButton";
import Tooltip from "./Tooltip";

const Header: React.FC = () => {
  // later, every button will be presented as a separate component
  const buttons = [
    <Tooltip content="Refresh" placement="bottom"><Refresh /></Tooltip>,
    <Tooltip content="Undo" placement="bottom"><Undo /></Tooltip>,
    <Tooltip content="Redo" placement="bottom"><Redo /></Tooltip>,
    <SearchButton />,
    <UploadButton />,
    <Tooltip content="Save" placement="bottom"><Save /></Tooltip>,
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
import React from "react";

import { ReactComponent as Refresh } from "../assets/refresh.svg";
import { ReactComponent as Undo } from "../assets/undo.svg";
import { ReactComponent as Redo } from "../assets/redo.svg";
import { ReactComponent as Search } from "../assets/search.svg";
import { ReactComponent as Upload } from "../assets/upload.svg";
import { ReactComponent as Save } from "../assets/save.svg";

interface IHeaderItems {
  icon: React.ReactElement;
  name: string;
}

const Header: React.FC = () => {
  const items: IHeaderItems[] = [
    {icon: <Refresh />, name: "Refresh"},
    {icon: <Undo />, name: "Undo"},
    {icon: <Redo />, name: "Redo"},
    {icon: <Search />, name: "Upload an image from Unsplash"},
    {icon: <Upload />, name: "Upload an image"},
    {icon: <Save />, name: "Save"},
  ];
  return (
    <header className="header">
      <div className="header__items">
        {items.map((item, index) => {
          return (
            <React.Fragment>
              <div className="header__item">
                {item.icon}
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
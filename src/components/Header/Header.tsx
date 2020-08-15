import React from "react";
import UploadButton from "./UploadButton";
import SaveButton from "./SaveButton";
import RedoButton from "./RedoButton";
import UndoButton from "./UndoButton";
import RefreshButton from "./RefreshButton";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__items">
        <div className="header__item"><RefreshButton /></div>
        <div className="header__item"><UndoButton /></div>
        <div className="header__item"><RedoButton /></div>
        <div className="separator"></div>
        <div className="header__item"><UploadButton /></div>
        <div className="header__item"><SaveButton /></div>
      </div>
    </header>
  );
};

export default Header;
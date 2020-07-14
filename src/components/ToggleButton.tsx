import React from "react";

type Props = {
  title: string;
  callback: () => void;
  checked: boolean;
}

const ToggleButton: React.FC<Props> = props => {
  const {title, callback, checked} = props;
  return (
    <>
      <div className="toolbar__block toggle-btn__wrapper">
        <p className="toggle-btn__title">{title}</p>
        <input
          type="checkbox"
          checked={checked}
          onChange={callback}
          className="toggle-btn checkbox"
        />
      </div>
    </>
  );
};

export default ToggleButton;
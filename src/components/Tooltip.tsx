import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import TooltipElement from "./TooltipElement";

type Props = {
  content: string;
  placement: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<Props> = ({content, placement, children}) => {
  const targetElRef = useRef(null);
  const [isVisible, toggleVisibility] = useState(false);
  const [isRemoved, remove] = useState(false);

  const show = () => toggleVisibility(true);
  const hide = () => toggleVisibility(false);
  const mouseMoveHandler = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isCursorOnTarget = target.closest(".tooltip__container");
    if (isCursorOnTarget && !isVisible && !isRemoved) {
      show();
    }
  };
  const clickHandler = () => {
    if (isVisible) {
      hide();
      remove(true);
    }
  };

  return (
    <>
      <div
        className="tooltip__container"
        ref={targetElRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseMove={mouseMoveHandler}
        onClick={clickHandler}
      >
        {children}
      </div>
      {isVisible && ReactDOM.createPortal(
        <TooltipElement
          content={content}
          placement={placement}
          targetEl={targetElRef.current}
        />,
        document.body,
      )}
    </>
  );
};

export default Tooltip;
import React, { useEffect, useRef } from "react";
import TooltipPosition from "../helpers/setTooltipPosition";

type Props = {
  content: string;
  placement: string;
  targetEl: HTMLDivElement | null;
}

const TooltipElement: React.FC<Props> = ({content, placement, targetEl}) => {
  const tooltipRef = useRef(null);
  const triangleRef = useRef(null);

  const tooltipPosition = new TooltipPosition();
  const setTooltipPosition = () => {
    tooltipPosition.setTooltipPosition(
      placement,
      targetEl,
      tooltipRef.current,
      triangleRef.current,
    );
  };
  useEffect(setTooltipPosition);

  return (
    <div
      className={`tooltip tooltip_${placement} hidden`}
      ref={tooltipRef}
    >
      <div
        className="tooltip__triangle"
        ref={triangleRef}
      ></div>
      {content}
    </div>
  );
};

export default TooltipElement;
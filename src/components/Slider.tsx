import React from "react";
import RcSlider from "rc-slider";

type Props = {
  title: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  startPoint?: number;
  marks?: any;
  renderIcon?: () => JSX.Element;
  callback: (value: number) => void;
}

const Slider: React.FC<Props> = props => {
  const {
    title,
    value,
    min,
    max,
    step = 1,
    startPoint = 0,
    marks = {},
    callback,
  } = props;
  return (
    <div className="toolbar__block">
      <div className="slider__header">
        <p className="slider__title">{title}</p>
        <span className="slider__input">{value}</span>
      </div>
      <RcSlider
        value={value}
        min={min}
        max={max}
        startPoint={startPoint}
        step={step}
        onChange={num => callback(num)}
        marks={marks}
      />
    </div>
  );
};

export default Slider;
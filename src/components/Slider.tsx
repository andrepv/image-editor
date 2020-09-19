import React from "react";

type Props = {
  title: string;
  value: string;
  min: string;
  max: string;
  step?: string;
  renderIcon?: () => JSX.Element;
  callback: (value: number) => void;
}

const Slider: React.FC<Props> = props => {
  const {title, value, min, max, step = 1, callback} = props;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    callback(Number(event.target.value));
  };

  return (
    <div className="toolbar__block">
      <div className="slider__header">
        <p className="slider__title">{title}</p>
        <span className="slider__input">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="slider"
      />
    </div>
  );
};

export default Slider;
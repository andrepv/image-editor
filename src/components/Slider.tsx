import React from "react";

type Props = {
  title: string;
  value: string;
  min: string;
  max: string;
  callback: (value: number) => void;
}

const Slider: React.FC<Props> = props => {
  const {title, value, min, max, callback} = props;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const minValue = Number(min);
    const maxValue = Number(max);
    let inputValue = parseInt(String(event.target.value), 10);
    if (isNaN(inputValue)) {
      inputValue = minValue;
    }
    inputValue = Math.max(inputValue, minValue);
    inputValue = Math.min(inputValue, maxValue);
    callback(inputValue);
  };

  return (
    <div className="toolbar__block">
      <div className="slider__header">
        <p className="slider__title">{title}</p>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="slider__input"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        className="slider"
      />
    </div>
  );
};

export default Slider;
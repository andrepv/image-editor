import React from "react";
import { shallow, mount } from "enzyme";
import Tooltip from "../components/Tooltip";
import TooltipElement from "../components/TooltipElement";
import { TooltipPosition } from "../helpers/setTooltipPosition";

describe("<Tooltip />", () => {
  const props = {
    content: "test",
    placement: "right",
  };

  it("should match the snapshot", () => {
    const component = shallow(
      <Tooltip {...props}>
        <div>Target Element</div>
      </Tooltip>
    );
    expect(component.html()).toMatchSnapshot();
  });

  it("should toggle <TooltipElement/> on hover", () => {
    const wrapper = mount(<Tooltip {...props} />);
    const tooltipClassName = `.tooltip_${props.placement}`;
    expect(wrapper.find(tooltipClassName)).toHaveLength(0);

    wrapper.find(".tooltip__container").simulate("mouseEnter");
    expect(wrapper.find(tooltipClassName)).toHaveLength(1);

    wrapper.find(".tooltip__container").simulate("mouseLeave");
    expect(wrapper.find(tooltipClassName)).toHaveLength(0);

    wrapper.find(".tooltip__container").simulate("mouseMove");
    expect(wrapper.find(tooltipClassName)).toHaveLength(1);
  });
});

describe("<TooltipElement />", () => {
  const props = {
    content: "test",
    placement: "right",
    targetEl: <div>Target Element</div>,
  };

  it("should match the snapshot", () => {
    const component = shallow(<TooltipElement {...props}/>);
    expect(component.html()).toMatchSnapshot();
  });

  it("setTooltipPosition method should be called", () => {
    TooltipPosition.prototype.setTooltipPosition = jest.fn();
    mount(<TooltipElement {...props}/>);
    expect(TooltipPosition.prototype.setTooltipPosition.mock.calls.length)
    .toBe(1);
  });
});

describe("TooltipPosition", () => {
  it("should be displayed according to the 'placement' parameter", () => {
    const tooltipPosition = new TooltipPosition();
    tooltipPosition.targetEl = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100,
      width: 50,
      height: 50,
    };
    tooltipPosition.tooltip = {
      top: 40,
      right: 110,
      bottom: 110,
      left: 10,
      width: 80,
      height: 50,
    };
    tooltipPosition.bodyWidth = 500;
    tooltipPosition.placement = "right";
    let coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", 110);
    expect(coords).toHaveProperty("y", 100);

    tooltipPosition.placement = "left";
    coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", 10);
    expect(coords).toHaveProperty("y", 100);

    tooltipPosition.placement = "top";
    coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", 85);
    expect(coords).toHaveProperty("y", 40);

    tooltipPosition.placement = "bottom";
    coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", 85);
    expect(coords).toHaveProperty("y", 110);
  });

  it("should change position if the width doesn't fit in the viewport", () => {
    const tooltipPosition = new TooltipPosition();
    tooltipPosition.targetEl = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 90,
      width: 50,
      height: 50,
    };
    tooltipPosition.tooltip = {
      top: -10,
      right: 110,
      bottom: 110,
      left: -20,
      width: 100,
      height: 100,
    };
    tooltipPosition.bodyWidth = 100;
    tooltipPosition.replaceTooltipClass = jest.fn();
    tooltipPosition.setTrianglePosition = jest.fn();

    tooltipPosition.placement = "right";
    let coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", -20);
    expect(coords).toHaveProperty("y", 75);
    expect(tooltipPosition.replaceTooltipClass)
    .toBeCalledWith("tooltip_left", "tooltip_right");

    tooltipPosition.placement = "left";
    coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", 110);
    expect(coords).toHaveProperty("y", 75);
    expect(tooltipPosition.replaceTooltipClass)
    .toBeCalledWith("tooltip_right", "tooltip_left");

    tooltipPosition.placement = "top";
    coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", -10);
    expect(coords).toHaveProperty("y", 110);
    expect(tooltipPosition.replaceTooltipClass)
    .toBeCalledWith("tooltip_bottom", "tooltip_top");
    expect(tooltipPosition.setTrianglePosition).toBeCalledWith(125);

    tooltipPosition.placement = "bottom";
    tooltipPosition.offset = 10;
    window.innerHeight = 200;
    tooltipPosition.targetEl.left = 10;
    coords = tooltipPosition.getTooltipCoords();
    expect(coords).toHaveProperty("x", 10);
    expect(coords).toHaveProperty("y", -10);
    expect(tooltipPosition.replaceTooltipClass)
    .toBeCalledWith("tooltip_top", "tooltip_bottom");
    expect(tooltipPosition.setTrianglePosition).toBeCalledWith(25);
  });
});
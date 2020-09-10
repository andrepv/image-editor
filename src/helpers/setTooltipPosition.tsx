import { getCoords } from "./getCoords";

interface IElementData {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

interface ICoords {
  x: number;
  y: number;
}

const initialElementData: IElementData = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
};

export class TooltipPosition {
  private placement: string = "";
  private tooltipElement: HTMLDivElement | null = null;
  private triangleElement: HTMLDivElement | null = null;
  private targetEl: IElementData = {...initialElementData};
  private tooltip: IElementData = {...initialElementData};
  private bodyWidth: number = document.body.offsetWidth;
  private offset: number = 10;

  setTooltipPosition(
    placement: string,
    targetEl: HTMLDivElement | null,
    tooltip: HTMLDivElement | null,
    triangle: HTMLDivElement | null,
  ): void {
    if (!tooltip || !targetEl || !triangle) {
      return;
    }

    this.placement = placement;
    this.tooltipElement = tooltip;
    this.triangleElement = triangle;
    this.targetEl = this.getTargetElementData(targetEl);
    this.tooltip = this.getTooltipElementData(tooltip);

    const coords = this.getTooltipCoords();
    if (coords) {
      this.tooltipElement.style.top = `${coords.y}px`;
      this.tooltipElement.style.left = `${coords.x}px`;
      this.tooltipElement.classList.remove("hidden");
    }
  }

  private getTooltipCoords(): ICoords | undefined {
    let coords;
    switch (this.placement) {
      case "right":
      case "left":
        coords = this.getHorizontalTooltipCoords();
        break;
      case "bottom":
      case "top":
        coords = this.getVerticalTooltipCoords();
        break;
    }
    if (coords) {
      return {
        x: coords.x,
        y: coords.y,
      };
    }
  }

  private getHorizontalTooltipCoords(): ICoords {
    const yCoord = (
      this.targetEl.top + this.targetEl.height / 2 - this.tooltip.height / 2
    );
    const xCoord = this.placement === "right"
    ? this.getRightTooltipXCoord()
    : this.getLeftTooltipXCoord();
    return {y: yCoord, x: xCoord};
  }

  private getVerticalTooltipCoords(): ICoords {
    const yCoord = this.placement === "bottom"
      ? this.getBottomTooltipYCoord()
      : this.getTopTooltipYCoord();
    const xCoord = this.getVerticalTooltipXCoord();
    return {y: yCoord, x: xCoord};
  }

  private getRightTooltipXCoord(): number {
    const isTipInViewport = (
      this.targetEl.right + this.tooltip.width < this.bodyWidth
    );
    const coord = isTipInViewport ? this.tooltip.right : this.tooltip.left;
    if (!isTipInViewport) {
      this.replaceTooltipClass("tooltip_left", "tooltip_right");
    }
    return coord;
  }

  private getLeftTooltipXCoord(): number {
    const isTipInViewport = this.targetEl.left - this.tooltip.width > 0;
    const coord = isTipInViewport ? this.tooltip.left : this.tooltip.right;
    if (!isTipInViewport) {
      this.replaceTooltipClass("tooltip_right", "tooltip_left");
    }
    return coord;
  }

  private getBottomTooltipYCoord(): number {
    const isTipInViewport = (
      this.tooltip.bottom + this.tooltip.height < window.innerHeight
    );
    const coord = isTipInViewport ? this.tooltip.bottom : this.tooltip.top;
    if (!isTipInViewport) {
      this.replaceTooltipClass("tooltip_top", "tooltip_bottom");
    }
    return coord;
  }

  private getTopTooltipYCoord(): number {
    const isTipInViewport = this.tooltip.top > 0;
    const coord = isTipInViewport ? this.tooltip.top : this.tooltip.bottom;
    if (!isTipInViewport) {
      this.replaceTooltipClass("tooltip_bottom", "tooltip_top");
    }
    return coord;
  }

  private getVerticalTooltipXCoord(): number {
    const targetElСenter = this.targetEl.left + this.targetEl.width / 2;
    const tooltipRightEdge = targetElСenter + this.tooltip.width / 2;
    const tooltipLeftEdge = targetElСenter - this.tooltip.width / 2;
    let coord = tooltipLeftEdge;

    if (tooltipRightEdge > this.bodyWidth) {
      coord = this.bodyWidth - this.tooltip.width - this.offset;
      this.setTrianglePosition(targetElСenter - coord);
    } else if (tooltipLeftEdge < 0) {
      coord = this.offset;
      this.setTrianglePosition(this.targetEl.width / 2);
    }
    return coord;
  }

  private setTrianglePosition(coord: number): void {
    if (this.triangleElement) {
      this.triangleElement.style.left = `${coord}px`;
    }
  }

  private replaceTooltipClass(
    newClassName: string,
    oldClassName: string,
  ): void {
    if (this.tooltipElement) {
      this.tooltipElement.classList.remove(oldClassName);
      this.tooltipElement.classList.add(newClassName);
    }
  }

  private getTargetElementData(targetEl: HTMLDivElement): IElementData {
    return {
      top: getCoords(targetEl).top,
      right: getCoords(targetEl).right,
      bottom: getCoords(targetEl).bottom,
      left: getCoords(targetEl).left,
      width: targetEl.offsetWidth,
      height: targetEl.offsetHeight,
    };
  }

  private getTooltipElementData(tooltip: HTMLDivElement): IElementData {
    return {
      top: this.targetEl.top - tooltip.offsetHeight - this.offset,
      right: this.targetEl.right + this.offset,
      bottom: this.targetEl.bottom + this.offset,
      left: this.targetEl.left - tooltip.offsetWidth - this.offset,
      width: tooltip.offsetWidth,
      height: tooltip.offsetHeight,
    };
  }
}

const tooltipPosition = new TooltipPosition();
export default tooltipPosition;
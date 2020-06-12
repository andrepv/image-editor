export interface ICoords {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export function getCoords(element: HTMLElement): ICoords {
  const rect = element.getBoundingClientRect();
  const scrollLeft = (
    window.pageXOffset || document.documentElement.scrollLeft
  );
  const scrollTop = (
    window.pageYOffset || document.documentElement.scrollTop
  );
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    right: rect.left + scrollLeft + element.offsetWidth,
    bottom: rect.top + scrollTop + element.offsetHeight,
  };
}
import React, { useRef, useEffect } from "react";
import useStore from "../helpers/useStore";
import { autorun } from "mobx";
import { useObserver } from "mobx-react";

const Canvas = () => {
  const { canvasStore: store } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasEl = canvasRef.current;

  const onWheelHandler = (event: WheelEvent) => {
    event.preventDefault();
    if (!store.imageUrl) {
      return;
    }
    if (event.deltaY > 0) {
      store.increaseScale();
    } else {
      store.decreaseScale();
    }
  };

  useEffect(() => {
    if (!canvasEl) {
      return;
    }
    store.setCanvasElement(canvasEl);
    canvasEl.addEventListener("wheel", onWheelHandler);
    autorun(() => drawImage(store.imageUrl, canvasEl, store.scale));
    return () => {
      canvasEl.removeEventListener("wheel", onWheelHandler);
    };
  }, [canvasEl]);

  return useObserver(() => (
    <section className="canvas">
      <canvas ref={canvasRef}></canvas>
    </section>
  ));
};

function drawImage(
  imageUrl: string,
  canvasEl: HTMLCanvasElement,
  scale: number,
) {
  const img = new Image();
  const ctx = canvasEl.getContext("2d");
  img.setAttribute("crossorigin", "anonymous");
  if (imageUrl && ctx) {
    const parent = canvasEl.parentNode as HTMLElement;
    img.addEventListener("load", () => {
      const { width, height } = getImageSize(img, scale);
      const shouldScrollDown = shouldMoveVerticalScrollbar(
        parent.scrollTop,
        canvasEl.offsetHeight,
      );
      const shouldScrollRight = shouldMoveHorizontalScrollbar(
        parent.scrollLeft,
        canvasEl.offsetWidth,
        parent.offsetWidth,
      );

      canvasEl.width = width;
      canvasEl.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      if (shouldScrollRight) {
        const shiftX = canvasEl.offsetWidth / 2 - parent.offsetWidth / 2;
        parent.scrollTo(shiftX, parent.scrollTop);
      }
      if (shouldScrollDown) {
        const shiftY = canvasEl.offsetHeight / 2 - window.innerHeight / 2;
        parent.scrollTo(parent.scrollLeft, shiftY);
      }
    }, false);
  }
  img.src = imageUrl;
}

function shouldMoveVerticalScrollbar(
  scrollTop: number,
  containerHeight: number,
) {
  const currentPosition = Math.floor(scrollTop);
  const scrollbarCenterPosition = Math.floor(
    Math.max(
      containerHeight / 2 - window.innerHeight / 2, 0,
    ),
  );
  return scrollbarCenterPosition === currentPosition;
}

function shouldMoveHorizontalScrollbar(
  scrollLeft: number,
  canvasWidth: number,
  canvasContainerWidth: number,
) {
  const currentPosition = Math.floor(scrollLeft);
  const scrollbarCenterPosition = Math.floor(
    Math.max(
      canvasWidth / 2 - canvasContainerWidth / 2, 0,
    ),
  );
  return scrollbarCenterPosition === currentPosition;
}

function getImageSize(img: HTMLImageElement, scale: number) {
  const containerHeight = 0.85 * window.innerHeight * scale;
  const ratio = img.width / img.height;
  const height = Math.min(containerHeight / ratio, containerHeight);
  const width = ratio * height;
  return {width, height};
}

export default Canvas;
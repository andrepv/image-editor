import React, { useRef, useEffect } from "react";
import useStore from "../helpers/useStore";
import { autorun } from "mobx";
import { useObserver } from "mobx-react";
import { ReactComponent as Plus } from "../assets/plus.svg";
import { ReactComponent as Minus } from "../assets/minus.svg";
import Tooltip from "./Tooltip";

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
    <section className="canvas custom-scrollbar">
      <canvas ref={canvasRef}></canvas>
      {store.imageUrl && (
      <div className="zoom">
        <button className="zoom-in" onClick={() => store.increaseScale()}>
          <Tooltip content="Zoom In" placement="top">
            <Plus/>
          </Tooltip>
        </button>
        <p>{`${Math.floor(store.scale * 100)}%`}</p>
        <button className="zoom-out" onClick={() => store.decreaseScale()}>
          <Tooltip content="Zoom Out" placement="top">
            <Minus />
          </Tooltip>
        </button>
      </div>
      )}
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
      const isInCenter = isScrollbarInCenter(
        parent.scrollTop,
        canvasEl.offsetHeight,
      );

      canvasEl.width = width;
      canvasEl.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      if (isInCenter) {
        const shift = canvasEl.offsetHeight / 2 - window.innerHeight / 2;
        parent.scrollTo(0, shift);
      }
    }, false);
  }
  img.src = imageUrl;
}

function isScrollbarInCenter(scrollTop: number, containerHeight: number) {
  const currentPosition = Math.floor(scrollTop);
  const scrollbarCenterPosition = Math.floor(
    Math.max(
      containerHeight / 2 - window.innerHeight / 2, 0,
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
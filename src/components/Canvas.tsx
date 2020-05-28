import React, { useRef, useEffect } from "react";
import useStore from "../helpers/useStore";
import { autorun } from "mobx";
import { useObserver } from "mobx-react";
import { ReactComponent as Plus } from "../assets/plus.svg";
import { ReactComponent as Minus } from "../assets/minus.svg";
import Tooltip from "./Tooltip";

const Canvas = () => {
  const { canvasStore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      return;
    }

    canvasStore.setCanvasElement(canvasEl);
    const ctx = canvasEl.getContext("2d");

    autorun(() => {
      const { imageUrl, scale} = canvasStore;
      drawImage(imageUrl, ctx, canvasEl, scale);
    });
  }, []);

  const zoomIn = () => {
    const scale = Math.min(canvasStore.scale + 0.1, 2);
    canvasStore.changeScale(scale);
  };

  const zoomOut = () => {
    const scale = Math.max(canvasStore.scale - 0.1, 0.3);
    canvasStore.changeScale(scale);
  };

  return useObserver(() => (
    <section className="canvas">
      <canvas ref={canvasRef}></canvas>
      {canvasStore.imageUrl && (
      <div className="zoom">
        <button className="zoom-in" onClick={zoomIn}>
          <Tooltip content="Zoom In" placement="top">
            <Plus/>
          </Tooltip>
        </button>
        <p>{`${Math.floor(canvasStore.scale * 100)}%`}</p>
        <button className="zoom-out" onClick={zoomOut}>
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
  ctx: CanvasRenderingContext2D | null,
  canvasEl: HTMLCanvasElement,
  scale: number,
) {
  const img = new Image();
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
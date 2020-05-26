import React, { useRef } from "react";
import { useObserver } from "mobx-react";
import useStore from "../helpers/useStore";
import { CanvasStore } from "../stores/canvasStrore";

const Canvas = () => {
  const { canvasStore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (canvasRef && canvasRef.current) {
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext("2d");
    drawImage(canvasStore, ctx, canvasEl);
  }

  return useObserver(() => (
    <section className="canvas">
      <div style={{display: "none"}}>{canvasStore.imageUrl}</div>
      <canvas
        ref={canvasRef}
        width={`${0.4 * window.innerWidth || 500}`}
        height={`${0.9 * window.innerHeight || 500}`}
      ></canvas>
    </section>
  ));
};

function drawImage(
  canvasStore: CanvasStore,
  ctx: CanvasRenderingContext2D | null,
  canvasEl: HTMLCanvasElement,
) {
  const img = new Image();
  if (canvasStore.imageUrl && ctx) {
    const canvasWidth = canvasEl.offsetWidth;
    const canvasHeight = canvasEl.offsetHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    img.addEventListener("load", () => {
      const { width, height } = getImageSize(img, canvasHeight);
      ctx.drawImage(
        img,
        canvasWidth / 2 - width / 2,
        canvasHeight / 2 - height / 2,
        width,
        height,
      );
    }, false);
  }
  img.src = canvasStore.imageUrl;
}

function getImageSize(img: HTMLImageElement, containerHeight: number) {
  const ratio = img.width / img.height;
  const height = Math.min(containerHeight / ratio, containerHeight);
  const width = ratio * height;
  return {width, height};
}

export default Canvas;
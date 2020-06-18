import React, { useRef, useEffect } from "react";
import { autorun } from "mobx";
import { useObserver } from "mobx-react";
import { fabric } from "fabric";

import useStore from "../helpers/useStore";
import CanvasAPI from "../helpers/CanvasAPI";

const Canvas = () => {
  const { canvasStore: store } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasEl = canvasRef.current;
  const onWheel = (event: any) => {
    event.preventDefault();
    if (!store.imageUrl || store.mode) {
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
    const fabricCanvas = new fabric.Canvas(canvasEl);
    const canvasAPI = new CanvasAPI(fabricCanvas);
    const canvas = canvasEl?.parentElement?.querySelector(".upper-canvas");
    store.setCanvasElement(canvasEl);
    canvas && canvas.addEventListener("wheel", onWheel);

    autorun(() => canvasAPI.renderImage(
      store.imageUrl,
      store.scale,
      store.mode,
    ));
  }, [canvasEl]);

  return useObserver(() => (
    <section className="canvas">
      <canvas ref={canvasRef}></canvas>
    </section>
  ));
};

export default Canvas;
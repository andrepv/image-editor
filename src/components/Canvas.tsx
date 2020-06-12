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

  useEffect(() => {
    if (!canvasEl) {
      return;
    }
    let fabricCanvas = new fabric.Canvas(canvasEl);
    const canvas = new CanvasAPI(fabricCanvas);
    store.setCanvasElement(canvasEl);
    autorun(() => canvas.renderImage(store.imageUrl, store.scale));
  }, [canvasEl]);

  return useObserver(() => (
    <section className="canvas">
      <canvas ref={canvasRef}></canvas>
    </section>
  ));
};

export default Canvas;
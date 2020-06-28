import React, { useRef, useEffect } from "react";
import { fabric } from "fabric";
import CanvasAPI from "../canvasAPI/CanvasAPI";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasEl = canvasRef.current;

  useEffect(() => {
    if (!canvasEl) {
      return;
    }
    const fabricCanvas = new fabric.Canvas(canvasEl);
    new CanvasAPI(fabricCanvas);
  }, [canvasEl]);

  return (
    <section className="canvas">
      <canvas ref={canvasRef}></canvas>
    </section>
  );
};

export default Canvas;
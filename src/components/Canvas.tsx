import React, { useRef, useEffect } from "react";
import useStore from "../hooks/useStore";

const Canvas = () => {
  const canvasRef = useRef<HTMLElement>(null);
  const canvasEl = canvasRef.current;
  const rootStore = useStore();

  useEffect(() => {
    if (!canvasEl) {
      return;
    }
    rootStore.addCanvasToDocument(canvasEl as HTMLElement);
  }, [canvasEl]);

  return (
    <section className="canvas" ref={canvasRef}></section>
  );
};

export default Canvas;
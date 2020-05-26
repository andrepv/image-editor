import React, { useRef } from "react";
import { useObserver } from "mobx-react";
import useStore from "../helpers/useStore";

const Canvas = () => {
  const { canvasStore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return useObserver(() => (
    <section className="canvas">
      <div style={{display: "none"}}>{canvasStore.imageUrl}</div>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
      ></canvas>
    </section>
  ));
};

export default Canvas;
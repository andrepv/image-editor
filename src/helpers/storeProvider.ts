import { createContext } from "react";
import { CanvasStore } from "../stores/canvasStore";
import { ToolbarStore } from "../stores/toolbarStore";
import { CropperStore } from "../stores/cropperStore";
import { ImageStore } from "../stores/imageStore";
import { DrawingStore } from "../stores/drawingStore";
import { TextStore } from "../stores/textStore";

type Stores = {
  canvasStore: CanvasStore,
  toolbarStore: ToolbarStore,
  cropperStore: CropperStore,
  imageStore: ImageStore,
  drawingStore: DrawingStore,
  textStore: TextStore,
}

export const StoreContext = createContext({} as Stores);
export const StoreProvider = StoreContext.Provider;
import { createContext } from "react";
import { CanvasStore } from "../stores/canvasStore";
import { CropperStore } from "../stores/cropperStore";
import { ImageStore } from "../stores/imageStore";
import { DrawingStore } from "../stores/drawingStore";
import { TextStore } from "../stores/textStore";
import { SearchStore } from "../stores/searchStore";
import { AppStore } from "../stores/appStore";

type Stores = {
  canvasStore: CanvasStore,
  cropperStore: CropperStore,
  imageStore: ImageStore,
  drawingStore: DrawingStore,
  textStore: TextStore,
  searchStore: SearchStore,
  appStore: AppStore,
}

export const StoreContext = createContext({} as Stores);
export const StoreProvider = StoreContext.Provider;
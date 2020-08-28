import { createContext } from "react";
import { CropperStore } from "../stores/cropperStore";
import { ImageStore } from "../stores/imageStore";
import { DrawingStore } from "../stores/drawingStore";
import { TextStore } from "../stores/textStore";
import { SearchStore } from "../stores/searchStore";
import { AppStore } from "../stores/appStore";
import { ObjectManagerStore } from "../stores/objectManagerStore";

type Stores = {
  cropperStore: CropperStore,
  imageStore: ImageStore,
  drawingStore: DrawingStore,
  textStore: TextStore,
  searchStore: SearchStore,
  appStore: AppStore,
  objectManagerStore: ObjectManagerStore,
}

export const StoreContext = createContext({} as Stores);
export const StoreProvider = StoreContext.Provider;
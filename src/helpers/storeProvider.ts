import { createContext } from "react";
import { CanvasStore } from "../stores/canvasStrore";

type Stores = {
  canvasStore: CanvasStore
}

export const StoreContext = createContext({} as Stores);
export const StoreProvider = StoreContext.Provider;
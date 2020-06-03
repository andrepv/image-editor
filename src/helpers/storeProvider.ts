import { createContext } from "react";
import { CanvasStore } from "../stores/canvasStrore";
import { ToolbarStore } from "../stores/toolbarStore";

type Stores = {
  canvasStore: CanvasStore,
  toolbarStore: ToolbarStore,
}

export const StoreContext = createContext({} as Stores);
export const StoreProvider = StoreContext.Provider;
import { createContext } from "react";
import { IRootStore } from "../stores/rootStore";

export const StoreContext = createContext({} as IRootStore);
export const StoreProvider = StoreContext.Provider;
import { createContext } from "react";
import { RootStore } from "../stores/rootStore";

export const StoreContext = createContext({} as RootStore);
export const StoreProvider = StoreContext.Provider;
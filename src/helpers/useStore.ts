import { useContext } from "react";
import { StoreContext } from "./storeProvider";

const useStore = () => useContext(StoreContext);
export default useStore;
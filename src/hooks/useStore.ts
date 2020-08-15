import { useContext } from "react";
import { StoreContext } from "../helpers/storeProvider";

const useStore = () => useContext(StoreContext);
export default useStore;
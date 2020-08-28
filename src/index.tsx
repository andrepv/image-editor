import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "./styles/main.scss";
import App from "./App";

import * as serviceWorker from "./serviceWorker";
import cropperStore from "./stores/cropperStore";
import imageStore from "./stores/imageStore";
import drawingStore from "./stores/drawingStore";
import textStore from "./stores/textStore";
import searchStore from "./stores/searchStore";
import appStore from "./stores/appStore";
import objectManagerStore from "./stores/objectManagerStore";
import { StoreProvider } from "./helpers/storeProvider";

const stores = {
  cropperStore,
  imageStore,
  drawingStore,
  textStore,
  searchStore,
  appStore,
  objectManagerStore,
};

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider value={stores}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
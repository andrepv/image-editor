import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "./styles/main.scss";
import App from "./App";

import * as serviceWorker from "./serviceWorker";
import canvasStore from "./stores/canvasStrore";
import toolbarStore from "./stores/toolbarStore";
import cropperStore from "./stores/cropperStore";
import { StoreProvider } from "./helpers/storeProvider";

const stores = {
  canvasStore,
  toolbarStore,
  cropperStore,
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
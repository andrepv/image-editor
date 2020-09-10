import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "./styles/main.scss";
import App from "./App";

import * as serviceWorker from "./serviceWorker";
import { StoreProvider } from "./helpers/storeProvider";
import rootStore from "./stores/rootStore";

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider value={rootStore}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
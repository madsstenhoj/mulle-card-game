import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";
import "./index.css";
import "core-js";
import "raf/polyfill";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import PlayMaker from "./logic/store";

const PlayMakerStore = new PlayMaker();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={PlayMakerStore}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

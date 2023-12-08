import * as React from "react";

import { createRoot } from "react-dom/client";
import Main from "./components/Main";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

import { Provider } from "react-redux";
import { store } from "@redux/Store";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

/* global document, Office, module, require */
import "./global.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from "@components/Toaster";

const rootElement: HTMLElement = document.getElementById("container");
const root = createRoot(rootElement);

let persistor = persistStore(store);

/* Render application after Office initializes */
Office.onReady(() => {
  root.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <FluentProvider theme={webLightTheme}>
          <Main />
          <div className="app-toaster">
            <Toast />
          </div>
        </FluentProvider>
      </PersistGate>
    </Provider>
  );
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root.render(NextApp);
  });
}

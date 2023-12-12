import { combineReducers, configureStore, UnknownAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

import LoginReducer from "./Actions/Auth";
import ProcessReducer from "./Actions/Process";

const rootReducer = combineReducers({
  auth: LoginReducer,
  process: ProcessReducer
});

const reducerProxy = (state: any, action: UnknownAction) => {
  if(action.type === 'logout') {
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
}

const persistConfig = {
  key: "root",
  version: 1,
  storage: storage,
  whitelist: ["auth", "process"],
};

const persistedReducer = persistReducer(persistConfig, reducerProxy);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type StoreDef = ReturnType<typeof store.getState>;

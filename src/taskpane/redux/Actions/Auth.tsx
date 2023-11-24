import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { StoreDef } from "../Store";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loader: false,
    isLoadData: 0,
    isSetManualMapped: false,
    stopwatchState: ""
  },
  reducers: {
    setUserHitLoadData: (state, action) => {
      state.isLoadData = action.payload;
    },
    setManualMapped: (state, action) => {
      state.isSetManualMapped = action.payload;
    },
    setLoader: (state, action) => {
      state.loader = action.payload;
    },
    setStopwatch: (state, action) => {
      state.stopwatchState = action.payload;
    },
  },
});

const selfSelect = (state: StoreDef) => state.auth;

export const userLoadDataSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.isLoadData
);
export const isManualMappedSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.isSetManualMapped
);
export const isLoaderSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.loader
);
export const isStopwatchSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.stopwatchState
);

export const {
  setUserHitLoadData,
  setManualMapped,
  setLoader,
  setStopwatch
} = authSlice.actions;

export default authSlice.reducer;

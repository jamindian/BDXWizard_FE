import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { StoreDef } from "../Store";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userActions: [],
    loader: false,
    isLoadData: 0,
    rawSovExist: false,
    isSetManualMapped: false,
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

export const {
  setUserHitLoadData,
  setManualMapped,
  setLoader
} = authSlice.actions;

export default authSlice.reducer;

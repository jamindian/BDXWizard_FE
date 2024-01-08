import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { StoreDef } from "../Store";
import { ProcessInitialState } from "../InitialStates";

const processSlice = createSlice({
  name: "process",
  initialState: ProcessInitialState,
  reducers: {
    setSheetChanged: (state) => {
      state.sheetChanged = state.sheetChanged + 1; // action.payload;
    },
    setSelectedSheetData: (state, action) => {
      state.selectedSheetData = {
        ...state.selectedSheetData,
        ...action.payload
      };
    },
    setLatestUserProfile: (state, action) => {
      state.latestUserProfile = action.payload;
    },
  },
});

const selfSelect = (state: StoreDef) => state.process;

export const isSheetChangedSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.sheetChanged
);
export const isSelectedSheetDataSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.selectedSheetData
);
export const isLatestUserProfileSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.latestUserProfile
);


export const {
  setSheetChanged,
  setSelectedSheetData,
  setLatestUserProfile
} = processSlice.actions;

export default processSlice.reducer;

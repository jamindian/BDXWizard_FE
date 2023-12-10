import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { StoreDef } from "../Store";

const processSlice = createSlice({
  name: "process",
  initialState: {
    sheetChanged: 0,
    unMappedColumns: [],
    selectedSheetData: {}
  },
  reducers: {
    setSheetChanged: (state) => {
      state.sheetChanged = state.sheetChanged + 1; // action.payload;
    },
    setUnMappedColumns: (state, action) => {
      state.unMappedColumns = action.payload;
    },
    setSelectedSheetData: (state, action) => {
      state.selectedSheetData = {
        ...state.selectedSheetData,
        ...action.payload
      };
    },
  },
});

const selfSelect = (state: StoreDef) => state.process;

export const isUnMappedColumnsSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.unMappedColumns
);
export const isSheetChangedSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.sheetChanged
);

export const {
    setSheetChanged,
    setUnMappedColumns,
    setSelectedSheetData
} = processSlice.actions;

export default processSlice.reducer;

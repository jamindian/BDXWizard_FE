import { createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { StoreDef } from "../Store";

const processSlice = createSlice({
  name: "process",
  initialState: {
    policies: 0,
    unMappedColumns: [],
  },
  reducers: {
    setSheetPolices: (state, action) => {
      state.policies = action.payload;
    },
    setUnMappedColumns: (state, action) => {
      state.unMappedColumns = action.payload;
    },
  },
});

const selfSelect = (state: StoreDef) => state.process;

export const isUnMappedColumnsSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.unMappedColumns
);
export const isSheetPoliciesSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.policies
);

export const {
    setSheetPolices,
    setUnMappedColumns
} = processSlice.actions;

export default processSlice.reducer;

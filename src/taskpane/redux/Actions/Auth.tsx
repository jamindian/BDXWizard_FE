import { createAsyncThunk, createDraftSafeSelector, createSlice } from "@reduxjs/toolkit";
import { StoreDef } from "../Store";
import { AuthInitialState } from "../InitialStates";

export const appLogout = createAsyncThunk("auth/logout", async function (_payload, thunkAPI) {
  thunkAPI.dispatch({ type: 'logout' });
});

const authSlice = createSlice({
  name: "auth",
  initialState: AuthInitialState,
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
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.currentUser = action.payload.currentUser;
    }
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
export const isLoggedInSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.isLoggedIn
);
export const isCurrentUserSelector = createDraftSafeSelector(
  selfSelect,
  (state) => state.currentUser
);

export const {
  setUserHitLoadData,
  setManualMapped,
  setLoader,
  setStopwatch,
  setIsLoggedIn
} = authSlice.actions;

export default authSlice.reducer;

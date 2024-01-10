export const AuthInitialState = {
    loader: false,
    isLoadData: 0,
    isSetManualMapped: false,
    stopwatchState: "",
    isLoggedIn: false,
    currentUser: undefined
};

export const ProcessInitialState = {
    sheetChanged: 0,
    selectedSheetData: {},
    latestUserProfile: {
        company_name: "", profile_name: "", poc_columns: []
    }
};

export const AuthInitialState = {
    loader: false,
    isLoadData: 0,
    isSetManualMapped: false,
    stopwatchState: "",
    isLoggedIn: false
};

export const ProcessInitialState = {
    sheetChanged: 0,
    unMappedRawColumns: [],
    unMappedProfileColumns: [],
    selectedSheetData: {},
    latestUserProfile: {
        company_name: "", profile_name: "", poc_columns: []
    }
};

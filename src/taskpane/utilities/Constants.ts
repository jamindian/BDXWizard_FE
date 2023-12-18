import { IStrings, IAppColor } from "@taskpaneutilities/Interface";

export const APP_TITLE = "BDX Wizard";

export const API_SUCCESS: number = 200;
export const TEMP_REQUIRED: number = 307;
export const API_CREATED: number = 201;
export const API_DELETE: number = 204;
export const API_UNAUTHORISED: number = 401;
export const API_DOES_NOT_EXIST: number = 404;

export const Strings: IStrings = {
  secret: "sOvwIzaRd",
  manuallyMapped: "M",
  backfillMapped: "AI",
  halfT: "=UNICHAR(8969)",
  arrowDown: "=UNICHAR(8595)",
};

export const AppColors: IAppColor = {
  primacy_red: "#E50E12",
  primacy_yellow: "#e1c624",
  primacy_green: "#27C95C",
  primacy_dark: "#1B2730",
  primacy_white: "#FFFFFF",
  primacy_black: "#000000",
  primacy_scrollbar_color: "#dee4e8",
  primacy_light_grey: "#f1f1f1",
  primacy_whitesmoke: "#ddd",
  primary_blue: "#0f94ce",
  primacy_orange: "#f5b61b",
  primary_light_blue: "#9BC2E6",
  primacy_brown: "brown",
  primacy_chart_orange: '#ef5017',
  primacy_chart_blue: '#0991cd',
  primacy_chart_yellow: '#f6d458',
  primacy_chart_fadedblue: '#4e81bc',
};

export const lookupNumberFormats: { value: number; symbol: string; }[] = [
  { value: 1e3, symbol: "K" },
  { value: 1e6, symbol: "M" },
  { value: 1e9, symbol: "B" },
  { value: 1e12, symbol: "T" },
  { value: 1e15, symbol: "P" },
  { value: 1e18, symbol: "E" },
];

export const appMainTabs: { id: number; label: string, condition: boolean; }[] = [
  { id: 0, label: "Transverse", condition: true },
  { id: 1, label: "Claims", condition: false },
  { id: 2, label: "Premium", condition: false },
  { id: 3, label: "Preferences", condition: true }
];

export const signUpFormFields = [
  { id: 1, label: "Email", key: "email", type: "email" },
  { id: 2, label: "Company Name", key: "company_name", type: "text" },
  { id: 3, label: "Password", key: "password", type: "password" },
];

export const AlertsMsgs = {
  unAuthorized: "Unauthorized access! Please login to continue.",
  requiredFields: "Fields with (*) are required.",
  somethingWentWrong: "Something went wrong!"
};

export const stagingAreaInitialColumns = {
  ID: { displayName: '', headerColor: '', bodyColor: '' },
  INSURER: { displayName: '', headerColor: '', bodyColor: '' },
  REPORTING_MONTH: { displayName: '', headerColor: '', bodyColor: '' },	
  UNDERWRITING_YEAR: { displayName: '', headerColor: '', bodyColor: '' },	
  UMR: { displayName: '', headerColor: '', bodyColor: '' },	
  MGA: { displayName: '', headerColor: '', bodyColor: '' },	
  TPA: { displayName: '', headerColor: '', bodyColor: '' },
  CLAIM_POLICY_NUMBER: { displayName: '', headerColor: '', bodyColor: '' },
  UNIQUE_CLAIM_REFERENCE: { displayName: '', headerColor: '', bodyColor: '' },
  LINE_OF_BUSINESS: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  CLASS_OF_BUSINESS: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  PRODUCT: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  RISK_INCEPTION_DATE: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  RISK_EXPIRY_DATE: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  INSURED_NAME: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  LOCATION_OF_LOSS_STATE_PROVINCE_TERRITORY_CANTON: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  CAT_CODE: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  CLAIM_STATUS: { displayName: '', headerColor: '', bodyColor: '' }, // Newly added
  DATE_CLAIM_FIRST_ADVISED_CLAIMS_MADE_DATE: { displayName: '', headerColor: '', bodyColor: '' },
  DATE_OF_LOSS: { displayName: '', headerColor: '', bodyColor: '' },
  INCIDENT_TYPECAUSE_OF_LOSS: { displayName: '', headerColor: '', bodyColor: '' },
  LOSS_DESCRIPTION: { displayName: '', headerColor: '', bodyColor: '' },
  NOTIFICATION_DATE: { displayName: '', headerColor: '', bodyColor: '' },	
  ORIGINAL_CURRENCY: { displayName: '', headerColor: '', bodyColor: '' },
  RISK_COUNTRY: { displayName: '', headerColor: '', bodyColor: '' },
  RISK_STATE_PROVINCE_TERRITORY_CANTON_ETC: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_INDEMNITY_PAID: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_PAID_INCLUDING_FEES: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_PAID_LESS_TOTAL_RECOVERIES: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_RECOVERY_RESERVES: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_RESERVES_INCLUDING_FEES: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_RESERVES_INDEMNITY: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_TPA_FEES_PAID: { displayName: '', headerColor: '', bodyColor: '' },
  TOTAL_TPA_FEES_RESERVES: { displayName: '', headerColor: '', bodyColor: '' },
  "Total Incurred Including Recoveries (excludes Reserve recoveries/salvage)": { displayName: '', headerColor: '', bodyColor: '' },
};
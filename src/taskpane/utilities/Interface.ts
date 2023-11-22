export interface IStrings {
  secret: string;
  manuallyMapped: string;
  backfillMapped: string;
  halfT: string;
  arrowDown: string;
}

export interface ISetIdValue {
  id: string | number | any;
  value: string | number | any;
}

export interface IColumnIdentify {
  displayName: string;
  headerColor: string;
  bodyColor: string; 
}

export interface IAppColor {
  primacy_red: string;
  primacy_yellow: string;
  primacy_green: string;
  primacy_dark: string;
  primacy_white: string;
  primacy_black: string;
  primacy_scrollbar_color: string;
  primacy_light_grey: string;
  primacy_whitesmoke: string;
  primary_blue: string;
  primary_light_blue: string;
  primacy_orange: string;
  primacy_brown: string;
  primacy_chart_orange: string;
  primacy_chart_blue: string;
  primacy_chart_yellow: string;
  primacy_chart_fadedblue: string;
}

export interface IStagingAreaColumns {
  FLAG: IColumnIdentify;
  ID: IColumnIdentify;
  INSURER: IColumnIdentify;
  REPORTING_MONTH: IColumnIdentify;	
  UNDERWRITING_YEAR: IColumnIdentify;	
  UMR: IColumnIdentify;	
  MGA: IColumnIdentify;	
  TPA: IColumnIdentify;
  CLAIM_POLICY_NUMBER: IColumnIdentify;	
  UNIQUE_CLAIM_REFERENCE: IColumnIdentify;	
  LINE_OF_BUSINESS: IColumnIdentify;	
  CLASS_OF_BUSINESS: IColumnIdentify;	
  PRODUCT: IColumnIdentify;	
  RISK_INCEPTION_DATE: IColumnIdentify;
  RISK_EXPIRY_DATE: IColumnIdentify;
  INSURED_NAME: IColumnIdentify;	
  LOCATION_OF_LOSS_STATE_PROVINCE_TERRITORY_CANTON: IColumnIdentify;
  RISK_STATE_PROVINCE_TERRITORY_CANTON_ETC: IColumnIdentify;	
  RISK_COUNTRY: IColumnIdentify;	
  CLAIM_STATUS: IColumnIdentify;	
  INCIDENT_TYPECAUSE_OF_LOSS: IColumnIdentify;	
  LOSS_DESCRIPTION: IColumnIdentify;
  ORIGINAL_CURRENCY: IColumnIdentify;	
  NOTIFICATION_DATE: IColumnIdentify;	
  DATE_OF_LOSS: IColumnIdentify;	
  CAT_CODE: IColumnIdentify;	
  TOTAL_TPA_FEES_PAID: IColumnIdentify;	
  TOTAL_INDEMNITY_PAID: IColumnIdentify;
  TOTAL_PAID_INCLUDING_FEES: IColumnIdentify;
  TOTAL_RECOVERY_RESERVES: IColumnIdentify;
  TOTAL_PAID_LESS_TOTAL_RECOVERIES: IColumnIdentify;
  TOTAL_TPA_FEES_RESERVES: IColumnIdentify; // Newly added
  TOTAL_RESERVES_INDEMNITY: IColumnIdentify; // Newly added
  TOTAL_RESERVES_INCLUDING_FEES: IColumnIdentify; // Newly added
  'Total Incurred Including Recoveries (excludes Reserve recoveries/salvage)': IColumnIdentify;
  DATE_CLAIM_FIRST_ADVISED_CLAIMS_MADE_DATE: IColumnIdentify;
}

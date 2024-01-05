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

export interface IStagingAreaColumn {
  id: number;
  column_name: string;
  order: number;
  active_for_mapping: boolean;
  header_colour_code: string;
  body_colour_code: string;
  display_name: string;
}

export interface IUserProfile {
  company_name: string; profile_name: string; poc_columns: string[];
  id: number; active: boolean;
  staging_constants: IStagingConstant[];
}

export interface IBasicObject {
  [key: string]: string;
}

export interface IStagingConstant{ columnName: string; constantValue: string; }

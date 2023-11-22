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
  LOCATION_NAME: IColumnIdentify;
  STREET: IColumnIdentify;	
  CITY: IColumnIdentify;	
  STATE: IColumnIdentify;	
  POSTAL: IColumnIdentify;	
  REPORTED_COUNTY: IColumnIdentify;
  MAPPED_COUNTY: IColumnIdentify;	
  COUNTY_TIER: IColumnIdentify;	
  HU_ZONE: IColumnIdentify;	
  EQ_ZONE: IColumnIdentify;	
  LATITUDE: IColumnIdentify;	
  LONGITUDE: IColumnIdentify;
  GEOCODE_CONFIDENCE: IColumnIdentify;
  GEOCODE_SOURCE: IColumnIdentify;	
  COUNTRY: IColumnIdentify;
  ELEVATION: IColumnIdentify;	
  CONSTRUCTION_CODE: IColumnIdentify;	
  OCCUPANCY_CODE: IColumnIdentify;	
  NUMBER_OF_STORIES: IColumnIdentify;	
  YEAR_BUILT: IColumnIdentify;	
  FLOOR_AREA: IColumnIdentify;	
  PRIMARY_BUILDING: IColumnIdentify;	
  LOCATION_GROUP: IColumnIdentify;	
  NUMBER_OF_BUILDINGS: IColumnIdentify;	
  TOTAL_BUILDING_VALUE: IColumnIdentify;	
  BUILDING_VALUE_1: IColumnIdentify; // Newly added
  BUILDING_VALUE_2: IColumnIdentify; // Newly added
  TOTAL_OTHER_VALUE: IColumnIdentify;
  TOTAL_CONTENTS_VALUE: IColumnIdentify;
  CONTENTS_VALUE_1: IColumnIdentify; // Newly added
  CONTENTS_VALUE_2: IColumnIdentify; // Newly added
  CONTENTS_VALUE_3: IColumnIdentify; // Newly added
  CONTENTS_VALUE_4: IColumnIdentify; // Newly added
  CONTENTS_VALUE_5: IColumnIdentify; // Newly added
  TOTAL_BI_VALUE: IColumnIdentify;
  BI_VALUE_1: IColumnIdentify; // Newly added
  BI_VALUE_2: IColumnIdentify; // Newly added
  TOTAL_INSURED_VALUES: IColumnIdentify;
  LOCPERILS: IColumnIdentify;
  LOCLIMITTYPE: IColumnIdentify;
  BUILDING_LIMIT: IColumnIdentify;
  OTHER_LIMIT: IColumnIdentify;
  CONTENTS_LIMIT: IColumnIdentify;	
  BI_LIMIT: IColumnIdentify;
  DAYS_COVERED: IColumnIdentify;
  TOTAL_LIMITS: IColumnIdentify;
  DEDUCTTYPE: IColumnIdentify;
  DEDUCTBLDG: IColumnIdentify;
  DEDUCTOTHER: IColumnIdentify;
  DEDUCTCONTENT: IColumnIdentify;
  DEDUCTTIME: IColumnIdentify;
  SITEDEDUCTIBLE: IColumnIdentify;
  SPRINKLER: IColumnIdentify;
  UPGRADE_YEAR: IColumnIdentify;
  PROTECTION_CLASS: IColumnIdentify;
  NUMBER_OF_UNITS: IColumnIdentify;
  ROOF_ANCHORAGE: IColumnIdentify;
  ROOF_GEOMETRY: IColumnIdentify;
  ROOF_YEAR_BUILT: IColumnIdentify;
  WINDOW_PROTECTION: IColumnIdentify;
  ROOF_COVER: IColumnIdentify;
  ROOF_DECK: IColumnIdentify;
  ROOF_PITCH: IColumnIdentify;
  ROOF_COVER_ATTACHMENT: IColumnIdentify;
  ROOF_DECK_ATTACHMENT: IColumnIdentify;
  ROOF_ATTACHED_STRUCTURE: IColumnIdentify;
  BUILDING_HEIGHT: IColumnIdentify;
  BUILDING_HEIGHT_UNIT_CODE: IColumnIdentify;
  FLOORS_OCCUPIED: IColumnIdentify;
  SHORT_COLUMN: IColumnIdentify;
  ORNAMENTATION: IColumnIdentify;
  FIRST_FLOOR_HEIGHT: IColumnIdentify;
  FIRST_FLOOR_HEIGHT_UNIT: IColumnIdentify;
  POUNDING: IColumnIdentify;
  CHIMNEY: IColumnIdentify;
  FOUNDATION_CONNECTION: IColumnIdentify;
  TORSION: IColumnIdentify;
  TANK: IColumnIdentify;
  BUILDING_SHAPE: IColumnIdentify;
  BUILDING_CONDITION: IColumnIdentify;
  REDUNDANCY: IColumnIdentify;
  EXTERNAL_DOORS: IColumnIdentify;
  TREE_EXPOSURE: IColumnIdentify;
  LARGE_MISSILE: IColumnIdentify;
  WALL_SIDING: IColumnIdentify;
}

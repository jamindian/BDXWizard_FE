
class Urls {
  public readonly getStagingAreaColumnsForClaims = '/meta_data/staging-area-claims/';
  public readonly getStagingAreaColumnsForPremium = '/meta_data/staging-area-premium/';
  public readonly getStagingAreaColumnsForPOC = '/meta_data/staging-area-poc/';
  public readonly mapColumns = '/process/map-columns/';
  public readonly stagingColumnsToMap  = '/meta_data/staging_area_column/staging-columns-to-map/';
  public readonly downloadCustomTemplate = '';
  public readonly trainAI = '/process/save-maps/';
}
  
const ApiUrls = new Urls();
export default ApiUrls;
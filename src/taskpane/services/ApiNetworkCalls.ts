import CommonMethods from "@taskpaneutilities/CommonMethods";
import ApiUrls from "@taskpane/services/ApiUrls";
import httpRequest from "@taskpane/services/AxiosInterceptor";

class ApiNetworkCalls {
    public async getStagingAreaColumnsForClaims(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.getStagingAreaColumnsForClaims}`, {
        headers: {},
      });
    }

    public async getStagingAreaColumnsForPremium(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.getStagingAreaColumnsForPremium}`, {
        headers: {},
      });
    }

    public async OnMapColumns(data: any): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.post(
        `${ApiUrls.mapColumns}`,
        {
          ...data,
        },
        {
          headers: {}
        }
      );
    }

    public async onTrainAI(data: any): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.post(
        `${ApiUrls.trainAI}`,
        {
          ...data,
        },
        {
          headers: {}
        }
      );
    }
}

const NetworkCalls = new ApiNetworkCalls();
export default NetworkCalls;
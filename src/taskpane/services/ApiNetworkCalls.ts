import CommonMethods from "@taskpaneutilities/CommonMethods";
import ApiUrls from "@taskpane/services/ApiUrls";
import httpRequest from "@taskpane/services/AxiosInterceptor";

class ApiNetworkCalls {
    public async getStagingAreaColumnsForClaims(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.getStagingAreaColumnsForClaims}`, {
        headers: {
          Authorization: `Bearer ${_token}`,
        }
      });
    }

    public async getStagingAreaColumnsForPremium(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.getStagingAreaColumnsForPremium}`, {
        headers: {
          Authorization: `Bearer ${_token}`,
        }
      });
    }

    public async getStagingAreaColumnsForPOC(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.getStagingAreaColumnsForPOC}`, {
        headers: {
          Authorization: `Bearer ${_token}`,
        }
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
          headers: {
            Authorization: `Bearer ${_token}`,
          }
        }
      );
    }

    public async onTrainAI(data: any): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.post(
        `${ApiUrls.trainAI}`, { ...data },
        { headers: { Authorization: `Bearer ${_token}` } }
      );
    }

    public async userSignIn(data: any): Promise<any> {
      return httpRequest.post(`${ApiUrls.signin}`, data);
    };

    public async userSignUp(data: any): Promise<any> {
      return httpRequest.post(`${ApiUrls.signup}`, data);
    };

    public async refreshToken(data: { refresh: string; }): Promise<any> {
      return httpRequest.post(`${ApiUrls.refreshToken}`, data);
    };

    public async forgotPassword(data: { email: string }): Promise<any> {
      return httpRequest.post(`${ApiUrls.forgotPassword}`, data);
    };

    public async resetPassword(data: { email: string; new_password: string; otp: string; }): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.put(`${ApiUrls.resetPassword}`, data, {
        headers: {
          Authorization: `Bearer ${_token}`,
        }
      });
    }

    public async userActivityLog(data: any): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.post(
        `${ApiUrls.userActivityLog}`, { ...data },
        { headers: { Authorization: `Bearer ${_token}` } }
      );
    }

    public async createUserPreference(data: any): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.post(
        `${ApiUrls.userPreference}`, { ...data },
        { headers: { Authorization: `Bearer ${_token}` } }
      );
    }

    public async getAllUserPreference(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.userPreference}`, {
        headers: {
          Authorization: `Bearer ${_token}`,
        }
      });
    }

    public async getCurrentActiveUser(): Promise<any> {
      let _token = CommonMethods.getAccessToken();
      return httpRequest.get(`${ApiUrls.getCurrentActiveUser}`, {
        headers: {
          Authorization: `Bearer ${_token}`,
        }
      });
    }
}

const NetworkCalls = new ApiNetworkCalls();
export default NetworkCalls;
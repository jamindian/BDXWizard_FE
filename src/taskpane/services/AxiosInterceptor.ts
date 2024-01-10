import axios, { AxiosInstance } from "axios";
import { toast } from "react-toastify";
// import CommonMethods from "@taskpaneutilities/CommonMethods";
import { API_DOES_NOT_EXIST, API_UNAUTHORISED, API_SUCCESS, API_DELETE } from "@taskpaneutilities/Constants";
import { store } from "@redux/Store";
import { setIsLoggedIn } from "@redux/Actions/Auth";

function httpErrorHandler(error) {
  if (error === null) throw new Error('Unrecoverable error!! Error is null!')
  if (axios.isAxiosError(error)) {
    //here we have a type guard check, error inside this if will be treated as AxiosError
    const response = error?.response
    const request = error?.request
    const config = error?.config //here we have access the config used to make the api call (we can make a retry using this conf)

    if (error.code === 'ERR_NETWORK') {
      toast.warning('connection problems..');
    } else if (error.code === 'ERR_CANCELED') {
      toast.error('connection canceled..');
    }

    if (response) {
      //The request was made and the server responded with a status code that falls out of the range of 2xx the http status code mentioned above
      const statusCode = response?.status
      if (statusCode === API_DOES_NOT_EXIST) {
        console.log('The requested resource does not exist or has been deleted');
      } else if (statusCode === API_UNAUTHORISED) {
        console.log('Please login to access this resource');
        if (response.data?.message) {
          toast.error(response.data?.message);
        } else {
          localStorage.clear();
          store.dispatch(setIsLoggedIn({ isLoggedIn: false, currentUser: undefined }));
        }
      } else if (statusCode === 300) {
        toast.warning(response.data?.message);
      } else if (statusCode === 504) {
        toast.error("Unable to process.");
      }
    } else if (request) {
            //The request was made but no response was received, `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in Node.js
      toast.info('The request was made but no response was received');
    }
  }

  return Promise.reject(error);
}

function createHttpInstance() {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL + "/api_v1",
    headers: {
      'Content-Type': 'application/json'
    },
    validateStatus: (status) => status >= API_SUCCESS && status <= API_DELETE,
    timeout: 300000
  });

  instance.interceptors.request.use(async (config) => {
    return config;
  });
  
  instance.interceptors.response.use((res) => {
    return res;
  }, (error) => {
    return httpErrorHandler(error);
  });

  return instance;
}

const httpRequest: AxiosInstance = createHttpInstance();
export default httpRequest;
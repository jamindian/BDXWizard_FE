// @devtayyab
import React, { useEffect, useState } from "react";

import App from "./App";
import Authentication from "./Authentication";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { APP_TITLE } from "@taskpaneutilities/Constants";
import { useSelector } from "react-redux";
import { isLoggedInSelector } from "@redux/Actions/Auth";

let isOfficeInitialized: boolean = true;
const title: string = APP_TITLE;

const Home = () => {
  const isLoggedIn: boolean = useSelector(isLoggedInSelector);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function run(){
      const name: string = await CommonMethods.getWorkbookName();
      global.workbookName = name;
    }
    run();
  }, []);

  useEffect(() => {
    const _token = CommonMethods.getAccessToken();
    if (isLoggedIn || _token) {
      setToken(_token);
    } else {
      setToken(null);
    }
  }, [isLoggedIn]);

  return React.useMemo(() => {
    if (token) {
      return (
        <App
          token={token}
          title={title}
          isOfficeInitialized={isOfficeInitialized}
        />
      );
    }
    
    return <Authentication />;
  }, [token, isOfficeInitialized, title]);
};

export default Home;

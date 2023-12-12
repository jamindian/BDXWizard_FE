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

  useEffect(() => {
    async function run(){
      const name: string = await CommonMethods.getWorkbookName();
      global.workbookName = name;
    }
    run();
  }, []);

  return React.useMemo(() => {
    if (isLoggedIn || CommonMethods.getAccessToken()) {
      return (
        <App
          token={CommonMethods.getAccessToken()}
          title={title}
          isOfficeInitialized={isOfficeInitialized}
        />
      );
    }
    
    return <Authentication />;
  }, [isLoggedIn, isOfficeInitialized, title]);
};

export default Home;

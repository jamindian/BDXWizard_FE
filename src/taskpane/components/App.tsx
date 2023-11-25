import * as React from "react";

import { makeStyles } from "@fluentui/react-components";

import AppLoader from "./AppLoader";
import DashboardButtons from "./DashboardButtons/DashboardButtons";
import Timer from "./Timer/Timer";

import { useSelector } from "react-redux";
import { isLoaderSelector, setLoader, setStopwatch } from "@redux/Actions/Auth";
import { store } from "@redux/Store";
import { Assets } from "@taskpane/utilities/Assets";
import Header from "./Header";
import InfoCards from "./InfoCards/InfoCards";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = () => {
  const styles = useStyles();
  const loader: boolean = useSelector(isLoaderSelector);

  React.useEffect(() => {
    store.dispatch(setLoader(false));
    store.dispatch(setStopwatch("reset"));
  }, []);

  return (
    <div className={styles.root}>
      {loader ? <AppLoader /> : null}
      <div className="sticky-area">
        <div className="ms-welcome__main">
          <div className="logo-container cursor-pointer">
            <Header
              logo={Assets.logoFilled}
              title={"BDX Wizard"}
            />
          </div>
          <div className={`cards-container`}>
            <InfoCards />
          </div>
        </div>
      </div>
      <DashboardButtons />
      <Timer />
    </div>
  );
};

export default App;

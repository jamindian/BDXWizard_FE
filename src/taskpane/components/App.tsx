import * as React from "react";

import { makeStyles } from "@fluentui/react-components";
import AppLoader from "./AppLoader";
import DashboardButtons from "./DashboardButtons/DashboardButtons";
import { useSelector } from "react-redux";
import { isLoaderSelector, setLoader } from "@redux/Actions/Auth";
import { store } from "@redux/Store";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = () => {
  const styles = useStyles();
  const loader: boolean = useSelector(isLoaderSelector);

  React.useEffect(() => {
    // store.dispatch(setLoader(false));
  }, []);

  return (
    <div className={styles.root}>
      {loader ? <AppLoader /> : null}
      <DashboardButtons />
    </div>
  );
};

export default App;

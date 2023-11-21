import * as React from "react";

import { makeStyles } from "@fluentui/react-components";
import AuthContext from "../context/AuthContext";
import AppLoader from "./AppLoader";
import DashboardButtonsGroup from "./DashboardButtons/DashboardButtons";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = () => {
  const styles = useStyles();
  const [loader, setLoader] = React.useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ setLoader }}>
      <div className={styles.root}>
        {loader ? <AppLoader /> : null}
        <DashboardButtonsGroup />
      </div>
    </AuthContext.Provider>
  );
};

export default App;

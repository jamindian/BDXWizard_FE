import * as React from "react";

import { makeStyles } from "@fluentui/react-components";
import AppLoader from "./AppLoader";
import DashboardButtons from "./DashboardButtons/DashboardButtons";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = () => {
  const styles = useStyles();
  const [loader, setLoader] = React.useState<boolean>(false);

  return (
    <div className={styles.root}>
      {loader ? <AppLoader /> : null}
      <DashboardButtons />
    </div>
  );
};

export default App;

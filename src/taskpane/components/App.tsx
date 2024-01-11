import * as React from "react";

import { makeStyles } from "@fluentui/react-components";
import { AppBar, Tab, Tabs } from "@mui/material";

import AppLoader from "./AppLoader";
import DashboardButtons from "./DashboardButtons/DashboardButtons";
import Preferences from './Preferences/Preferences';
import Timer from "./Timer/Timer";

import { useSelector } from "react-redux";
import { isCurrentUserSelector, isLoaderSelector, setLoader, setStopwatch } from "@redux/Actions/Auth";
import { Assets } from "@taskpane/utilities/Assets";
import Header from "./Header";
import InfoCards from "./InfoCards/InfoCards";
import { appMainTabs } from "@taskpaneutilities/Constants";
import TabPanel from "./TabPanel/TabPanel";
import { useDispatch } from "react-redux";

interface IAppProps {
  token: string;
  title: string;
  isOfficeInitialized: boolean;
}

const a11yProps = (index: any) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC<IAppProps> = () => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const loader: boolean = useSelector(isLoaderSelector);
  const currentUser = useSelector(isCurrentUserSelector);

  const [tabValue, setTabValue] = React.useState<number>(0);

  React.useEffect(() => {
    dispatch(setLoader(false));
    dispatch(setStopwatch("reset"));
  }, []);

  const handleChange = (_event, newValue: number): void => {
    setTabValue(newValue);
  };

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
            <InfoCards tabValue={tabValue} />
          </div>
        </div>
      </div>
      <div className={`addin-body`}>
        <AppBar position="sticky" color="primary">
          <Tabs
            value={tabValue}
            onChange={handleChange}
            aria-label="app main tabs"
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              sx: { background: "#fff" }
            }}
          >
            {[...appMainTabs].filter(f => f.condition).map((tab, index) => (
              <Tab
                value={tab.id}
                label={tab.label}
                {...a11yProps(tab.id)}
                key={index}
                style={{ color: "#fff", minWidth: tab.id === 1 ? 145 : tab.id === 3 ? 100 : 150 }}
              />
            ))}
          </Tabs>
        </AppBar>
        <TabPanel value={tabValue} index={0}>
          <DashboardButtons buttonName="Transverse" />
          <Timer />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <DashboardButtons buttonName="Claim" />
          <Timer />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <DashboardButtons buttonName="Premium" />
          <Timer />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Preferences companyName={currentUser?.company_name} />
        </TabPanel>
      </div>
    </div>
  );
};

export default App;

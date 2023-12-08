import React from "react";

import { Tab, Tabs, AppBar } from "@mui/material";
import SignUpPage from "./SignUp/SignUp";
import SignInPage from "./SignIn/SignIn";
import TabPanel from "@components/TabPanel/TabPanel";

const Authentication = () => {
  const [tabValue, setTabValue] = React.useState<number>(0);

  React.useEffect(() => {
  }, []);

  const handleChange = (_: React.ChangeEvent<{}>, newValue: number): void => {
    setTabValue(newValue);
  };

  const a11yProps = (index: any): { id: string; "aria-controls": string } => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  return (
    <>
      <AppBar position="static">
        <Tabs
          value={tabValue}
          onChange={handleChange}
          aria-label="simple tabs example"
          TabIndicatorProps={{
            sx: { background: "#fff" }
          }}
        >
          <Tab label="SignIn" {...a11yProps(0)} style={{ color: "#fff" }} />
          <Tab label="Register New User" {...a11yProps(1)} style={{ color: "#fff" }} />
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={0}>
        <SignInPage />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <SignUpPage />
      </TabPanel>
    </>
  );
};

export default Authentication;

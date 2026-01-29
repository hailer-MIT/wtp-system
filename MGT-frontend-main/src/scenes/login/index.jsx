import { useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Login from "../../components/Login";
import {
  ReceptionLogin,
  ReceptionSendOtp,
  SuperAdminLogin,
  DesignerLogin,
  DesignerSendOtp,
  WorkShopLogin,
  WorkShopSendOtp,
  ManagerSendOtp,
  ManagerLogin,
  InventoryClerkLogin,
  InventoryClerkSendOtp,
  AccountantLogin,
  AccountantForgotPassword,
  AccountantSendOtp,
  CashierLogin,
  CashierForgotPassword,
  CashierSendOtp,
  SuperAdminSendOtp,
} from "../../graphql/mutation";
import { useEffect, useContext } from "react";
import { SidebarCtx } from "../../context";
import { tokens } from "../../theme";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const { setLoggedIn } = useContext(SidebarCtx);

  useEffect(() => {
    setLoggedIn(false);
  });

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const LoginPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[900]} 100%)`, // Matches Sidebar gradient feel
      }}
    >
      <Box
        p={4}
        maxWidth={800} // Slightly wider
        width="100%"
        mx="auto"
        sx={{
          backgroundColor: `${colors.primary[400]}`,
          boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.4)",
          borderRadius: "20px",
          border: `1px solid ${colors.primary[500]}`,
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h2"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ letterSpacing: "1px", textTransform: "uppercase", mb: 1 }}
          >
            Wonderful Trading
          </Typography>
          <Typography variant="h5" color={colors.greenAccent[500]}>
            Order Management System
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="login tabs"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "600",
                fontSize: "14px",
                textTransform: "none",
                minWidth: "100px",
              },
              "& .Mui-selected": {
                color: `${colors.greenAccent[400]} !important`,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: colors.greenAccent[400],
                height: "3px",
                borderRadius: "3px",
              },
            }}
          >
            <Tab label="Reception" {...a11yProps(0)} />
            <Tab label="Cashier" {...a11yProps(1)} />
            <Tab label="Designer" {...a11yProps(2)} />
            <Tab label="Work Shop" {...a11yProps(3)} />
            <Tab label="Inventory Clerk" {...a11yProps(4)} />
            <Tab label="Manager" {...a11yProps(5)} />
            <Tab label="Accountant" {...a11yProps(6)} />
            <Tab label="Super Admin" {...a11yProps(7)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Login
            user="Reception"
            mutation={{ login: ReceptionLogin, Forget: ReceptionSendOtp }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Login
            user="Cashier"
            mutation={{ login: CashierLogin, Forget: CashierSendOtp }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Login
            user="Designer"
            mutation={{ login: DesignerLogin, Forget: DesignerSendOtp }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Login
            user="WorkShop"
            mutation={{ login: WorkShopLogin, Forget: WorkShopSendOtp }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Login
            user="InventoryClerk"
            mutation={{
              login: InventoryClerkLogin,
              Forget: InventoryClerkSendOtp,
            }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={5}>
          <Login
            user="Manager"
            mutation={{ login: ManagerLogin, Forget: ManagerSendOtp }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={6}>
          <Login
            user="Accountant"
            mutation={{ login: AccountantLogin, Forget: AccountantSendOtp }}
          ></Login>
        </TabPanel>
        <TabPanel value={value} index={7}>
          <Login
            user="SuperAdmin"
            mutation={{ login: SuperAdminLogin, Forget: SuperAdminSendOtp }}
          ></Login>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default LoginPage;

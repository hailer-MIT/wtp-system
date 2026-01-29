import { useState, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Users from "./scenes/users";
import Service from "./scenes/service";
import Inventory from "./scenes/inventory";
import Orders from "./scenes/orders";
import Profile from "./scenes/profile";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import LoginPage from "./scenes/login";
import ForgotPassword from "./scenes/forgotPassword";
import { SidebarCtx } from "./context";
import CustomizedSnackbar from "./components/CustomizedSnackbars";
import { useStoreState, useStoreActions } from "easy-peasy";
import { useQuery } from "@apollo/client";
import { AllServices } from "./graphql/query";
import { useEffect } from "react";
import { Notifications } from "react-push-notification";


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();
  const { loggedIn, SnackbarValue, setSnackbarValue } = useContext(SidebarCtx);
  const { openSnackbar, message, severity, location } = useStoreState(
    (state) => ({
      openSnackbar: state.snackbar.openSnackbar,
      severity: state.snackbar.severity,
      message: state.snackbar.message,
      location: state.router.location,
    })
  );

  const { setSnackbar, setLocation, setServices, setRefetch } = useStoreActions(
    (actions) => ({
      setSnackbar: actions.snackbar.setSnackbar,
      setLocation: actions.router.setLocation,
      setServices: actions.allServices.setServices,
      setRefetch: actions.allServices.setRefetch,
    })
  );
  const { data, loading, error, refetch } = useQuery(AllServices);

  useEffect(() => {
    if (location != "") navigate(location);
    if (data) {
      setServices(data.AllServices);
      setRefetch(refetch);
    }
  }, [location, data]);
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box position="relative">
          <Notifications />
          <div className="app">
            {loggedIn ? <div style={{
              zIndex: "100"
            }}><Sidebar isSidebar={isSidebar} /> </div>: <></>}
            <main className="content">
              {loggedIn ? <Topbar setIsSidebar={setIsSidebar} /> : <></>}
              <CustomizedSnackbar
                open={openSnackbar}
                setOpen={(openSnackbar) =>
                  setSnackbar({ openSnackbar, message, severity })
                }
                message={message}
                severity={severity}
              />
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                <Route path="/users" element={<Users />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/service" element={<Service />} />
                <Route
                  path="/current"
                  element={<Inventory title="current" />}
                />
                <Route path="/fixed" element={<Inventory title="fixed" />} />
                <Route
                  path="/accessory"
                  element={<Inventory title="accessory" />}
                />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

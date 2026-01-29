import { action } from "easy-peasy";
import { createContext, useContext, useState } from "react";

export const SidebarCtx = createContext();

const Context = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [filesList, setFilesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [SnackbarValue, setSnackbarValue] = useState({
    open: false,
    severity: "",
    message: "",
  });

  return (
    <SidebarCtx.Provider
      value={{
        loggedIn,
        setLoggedIn,
        filesList,
        setFilesList,
        servicesList,
        setServicesList,
        SnackbarValue,
        setSnackbarValue,
      }}
    >
      {children}
    </SidebarCtx.Provider>
  );
};

export default Context;

export const model = {
  snackbar: {
    openSnackbar: false,
    severity: "",
    message: "",
    setSnackbar: action((state, { openSnackbar, severity, message }) => {
      state.openSnackbar = openSnackbar;
      state.severity = severity;
      state.message = message;
    }),
  },
  router: {
    location: "",
    setLocation: action((state, location) => {
      state.location = location;
    }),
  },
  allServices: {
    services: [],
    refetch: "",
    setServices: action((state, services) => {
      state.services = services;
    }),
    setRefetch: action((state, refetch) => {
      state.refetch = refetch;
    }),
  },
  allOrders: {
    refetch: () => console.log("order"),
    row: {},
    setRefetch: action((state, refetch) => {
      state.refetch = refetch;
    }),
    setRow: action((state, row) => {
      state.row = row;
    }),
  },
  designFileUploadProgress: {
    queue: [],
    setQueue: action((state, file) => {
      state.queue.push(file);
    }),
  },
  apiUrl: {
    url: process.env.REACT_APP_API_URL || "https://wtp-oms.onrender.com",
    // Local development: "http://localhost:4000"
    // Production: "https://wtp-oms.onrender.com"
  },
  sidebar: {
    toggled: false,
    setToggled: action((state, t) => {
      state.toggled = t;
    }),
  },
};

import {
  Box,
  Button,
  Typography,
  useTheme,
  TextField,
  Grid,
  Stack,
  duration,
} from "@mui/material";
// import { DatePicker } from "@mui/lab";
import LoadingButton from "@mui/lab/LoadingButton";
import { tokens } from "../../theme";

import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";

//table
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

//dialog
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
import { useEffect, useState, useContext } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { SidebarCtx } from "../../context";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useQuery, useMutation } from "@apollo/client";
import {
  AllServices,
  OrdersStats,
  DesignerMyStat,
  DesignersStat,
  WorkShopMyStat,
  WorkShopStat,
  AllDesigners,
  AllWorkshops,
} from "../../graphql/query";
import { PlaceOrder } from "../../graphql/mutation";
///file
import { MuiFileInput } from "mui-file-input";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from '@mui/material/FormControl';
import axios from "axios";
import { DesignerMyOrder } from "../../graphql/query";

import DesignerOrders from "./DashboardComponents/designerOrders";
import WorkShopOrders from "./DashboardComponents/workShopOrders";
import CustomizedSnackbar from "../../components/CustomizedSnackbars";
import Inventory from "../inventory";
import { useStoreState } from "easy-peasy";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { placeOrderSchema, serviceSchema } from "../../yup/schema";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Orders from "../orders";

import { useStoreActions } from "easy-peasy";

// import logo from "../../../public/assets/MGT LOGO.png";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = localStorage.getItem("user");
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const setSnackbar = useStoreActions(
    (actions) => actions.snackbar.setSnackbar
  );
  const {
    setLoggedIn,
    filesList,
    servicesList,
    setServicesList,
    setFilesList,
  } = useContext(SidebarCtx);
  const [PlaceOrderF, { data, loading, error }] = useMutation(PlaceOrder);
  const [open, setOpen] = useState(false);
  const [calculatedFullPayment, setCalculatedFullPayment] = useState(0);

  const {
    data: Sdata,
    loading: Sloading,
    error: Serror,
  } = useQuery(OrdersStats, {
    skip:
      user != "Reception" &&
      user != "SuperAdmin" &&
      user != "Manager" &&
      user != "Cashier",
  });
  const {
    data: DUdata,
    loading: DUloading,
    error: DUerror,
  } = useQuery(AllDesigners, {
    skip: user != "Reception",
  });
  const {
    data: WUdata,
    loading: WUloading,
    error: WUerror,
  } = useQuery(AllWorkshops, {
    skip: user != "Reception",
  });
  const {
    data: Ddata,
    loading: Dloading,
    error: Derror,
  } = useQuery(DesignerMyStat, {
    skip: user != "Designer",
  });
  const {
    data: Wdata,
    loading: Wloading,
    error: Werror,
  } = useQuery(WorkShopMyStat, {
    skip: user != "WorkShop",
  });
  const {
    data: DesignersData,
    loading: DesignersLoading,
    error: DesignersError,
  } = useQuery(DesignersStat, {
    skip: user != "SuperAdmin" && user != "Manager",
  });
  const {
    data: WorkShopData,
    loading: WorkShopLoading,
    error: WorkShopError,
  } = useQuery(WorkShopStat, {
    skip: user != "SuperAdmin" && user != "Manager",
  });

  const handleFormSubmit = (values) => {
    console.log(values);
    console.log(filesList);
    if (servicesList.length)
      PlaceOrderF({
        variables: {
          contactPerson: values.contactPerson,
          phoneNumber: Number(values.phoneNumber),
          fullPayment: Number(values.fullPayment),
          advancePayment: Number(values.advancePayment),
          remainingPayment: Number(values.remainingPayment),
          deliveryDate: values.deliveryDate,
          files: filesList,
          services: servicesList,
          email: values.email,
          tinNumber: values.tinNumber,
          customerName: values.customerName,
          designedBy: values.designedBy,
          workShop: values.workShop,
        },
      }).then((res) => {
        setOpen(true);
        values.contactPerson = "";
        values.phoneNumber = "";
        values.fullPayment = "";
        values.advancePayment = "";
        values.remainingPayment = "";
        values.deliveryDate = "";
        values.email = "";
        values.tinNumber = "";
        values.customerName = "";
        values.workShop = null;
        values.designedBy = null;
        setFilesList([]);
        setServicesList([]);
      });
    else
      setSnackbar({
        openSnackbar: true,
        severity: "error",
        message: "Please add service",
      });
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("Browser does not support desktop notification");
    } else {
      Notification.requestPermission();
    }

    if (localStorage.getItem("token")) setLoggedIn(true);
    if (data) console.log("data", data);
    if (error) console.log("error", error);
    if (Sdata) console.log("data", Sdata);
    if (Serror) console.log("error", Serror);
  }, [data, error, Serror, Sdata]);

  // Calculate fullPayment whenever servicesList changes
  useEffect(() => {
    const totalFromServices = servicesList.reduce(
      (sum, service) => sum + (service.totalPrice || 0),
      0
    );
    setCalculatedFullPayment(totalFromServices);
  }, [servicesList]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {placeOrderForm()}
    </Box>
  );

  function Stats(props) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
      <>
        {props.data ? (
          <>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(auto-fit, minmax(225px, 1fr))",
                md: "repeat(4, 1fr)",
              }}
              gap={3}
              width="100%"
            >
              <Box
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                p={2}
                borderRadius="12px"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                sx={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <StatBox
                  title={`${props.data.lastMonthOrders} VS ${props.data.thisMonthOrders}`}
                  subtitle="Last month VS this Month "
                  progress={`${props.data.thisMonthOrders / props.data.lastMonthOrders
                    }`}
                  increase={
                    props.data.thisMonthOrders > props.data.lastMonthOrders
                      ? `+${(Math.round(
                        props.data.thisMonthOrders /
                        props.data.lastMonthOrders -
                        1
                      ) *
                        100 *
                        10) /
                      10
                      }%`
                      : ""
                  }
                  icon={
                    <DateRangeIcon
                      sx={{
                        color: colors.greenAccent[600],
                        fontSize: "26px",
                      }}
                    />
                  }
                />
              </Box>
              <Box
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                p={2}
                borderRadius="12px"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                sx={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <StatBox
                  title={`${props.data.completedOrders}`}
                  subtitle="Completed Orders"
                  progress={`${props.data.completedOrders / props.data.thisMonthOrders
                    }`}
                  increase={`${Math.round(
                    (props.data.completedOrders /
                      props.data.thisMonthOrders) *
                    100 *
                    10
                  ) / 10
                    }%`}
                  icon={
                    <DoneAllIcon
                      sx={{
                        color: colors.greenAccent[600],
                        fontSize: "26px",
                      }}
                    />
                  }
                />
              </Box>
              <Box
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                p={2}
                borderRadius="12px"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                sx={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <StatBox
                  title={`${props.data.pendingOrders}`}
                  subtitle="Pending Orders"
                  progress={`${props.data.pendingOrders / props.data.thisMonthOrders
                    }`}
                  increase={`${(Math.round(
                    props.data.pendingOrders / props.data.thisMonthOrders
                  ) *
                    100 *
                    10) /
                    10
                    }%`}
                  icon={
                    <PendingActionsIcon
                      sx={{
                        color: colors.greenAccent[600],
                        fontSize: "26px",
                      }}
                    />
                  }
                />
              </Box>
              <Box
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                p={2}
                borderRadius="12px"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                sx={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <StatBox
                  title={`${props.data.lateOrders}`}
                  subtitle="Late Orders"
                  progress={`${props.data.lateOrders / props.data.thisMonthOrders
                    }`}
                  increase={`${(Math.round(
                    props.data.lateOrders / props.data.thisMonthOrders
                  ) *
                    100 *
                    10) /
                    10
                    }%`}
                  icon={
                    <SentimentVeryDissatisfiedIcon
                      sx={{
                        color: colors.greenAccent[600],
                        fontSize: "26px",
                      }}
                    />
                  }
                />
              </Box>
            </Box>
          </>
        ) : (
          <></>
        )}
      </>
    );
  }

  function placeOrderForm() {
    const user = localStorage.getItem("user");

    return (
      <Box>
        <CustomizedSnackbar
          open={open}
          setOpen={setOpen}
          message={`Order Placed Successfully with orderNO ${data?.PlaceOrder?.orderNumber}`}
          severity="success"
        />
        {user == "Designer" ? (
          <>
            {Ddata && (
              <Typography fontSize={30} my={1} fontWeight="bold">
                Your Status
              </Typography>
            )}
            <Stats data={Dloading ? null : Ddata.DesignerMyStat} />
          </>
        ) : (
          <></>
        )}
        {user == "WorkShop" ? (
          <>
            {Wdata && (
              <Typography fontSize={30} my={1} fontWeight="bold">
                Your Status
              </Typography>
            )}
            <Stats data={Wloading ? null : Wdata.WorkShopMyStat} />
          </>
        ) : (
          <></>
        )}
        {user == "Reception" ||
          user == "SuperAdmin" ||
          user == "Manager" ||
          user == "Cashier" ? (
          <>
            {Sdata && (
              <Typography fontSize={30} my={1}>
                {Sdata.OrdersStats && "Over all Status"}
              </Typography>
            )}
            <Stats data={Sloading ? null : Sdata.OrdersStats} />
          </>
        ) : (
          <></>
        )}
        {(user == "Cashier" || user == "Accountant") && <Orders />}
        {user == "SuperAdmin" || user == "Manager" ? (
          <>
            {DesignersData && (
              <Typography fontSize={30} my={1}>
                {DesignersData.DesignersStat?.length != 0 &&
                  " Designers Status"}
              </Typography>
            )}
            {!DesignersData ? (
              <></>
            ) : (
              DesignersData.DesignersStat.map((d, index) => (
                <div key={index}>
                  <Typography
                    fontSize={20}
                    my={0.5}
                    px={2}
                    color={colors.greenAccent[400]}
                  >
                    {d.name}
                  </Typography>
                  <Stats data={d} />
                </div>
              ))
            )}
          </>
        ) : (
          <></>
        )}
        {user == "SuperAdmin" || user == "Manager" ? (
          <>
            {WorkShopData && (
              <Typography fontSize={30} my={1}>
                {WorkShopData.WorkShopStat?.length != 0 && "WorkShop Status"}
              </Typography>
            )}
            {!WorkShopData ? (
              <></>
            ) : (
              WorkShopData.WorkShopStat.map((d, index) => (
                <div key={index}>
                  <Typography
                    fontSize={20}
                    my={0.5}
                    px={2}
                    color={colors.greenAccent[400]}
                  >
                    {d.name}
                  </Typography>
                  <Stats data={d} />
                </div>
              ))
            )}
          </>
        ) : (
          <></>
        )}
        {user == "Designer" ? (
          <>
            <Typography fontSize={30} mb={1} mt={2} fontWeight="bold">
              Orders
            </Typography>
            <DesignerOrders />
          </>
        ) : (
          <></>
        )}
        {user == "WorkShop" ? (
          <>
            <Typography fontSize={30} mb={1} mt={2} fontWeight="bold">
              Orders
            </Typography>
            <WorkShopOrders />
          </>
        ) : (
          <></>
        )}
        {user == "InventoryClerk" ? (
          <>
            <Inventory title="current" />
          </>
        ) : (
          <></>
        )}
        {user == "Reception" ? (
          <>
            <Box backgroundColor={colors.primary[400]} minWidth={300} mt={3}>
              <Typography fontSize={35} textAlign="center" py={3}>
                Place order
              </Typography>
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={placeOrderSchema}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                }) => {
                  // Update fullPayment when calculatedFullPayment changes
                  if (calculatedFullPayment !== values.fullPayment && servicesList.length > 0) {
                    setFieldValue('fullPayment', calculatedFullPayment);
                  }

                  return (
                    <form onSubmit={handleSubmit}>
                      <Box display="flex" flexDirection="Column" gap={3} px={5}>
                        <Box
                          display="flex"
                          gap={3}
                          flexWrap={"wrap"}
                          flexGrow={1}
                        >
                          <TextField
                            variant="filled"
                            type="text"
                            label="CustomerName"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.customerName}
                            name="customerName"
                            error={
                              !!touched.customerName && !!errors.customerName
                            }
                            helperText={
                              touched.customerName && errors.customerName
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            variant="filled"
                            type="text"
                            label="Contact Person"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.contactPerson}
                            name="contactPerson"
                            error={
                              !!touched.contactPerson && !!errors.contactPerson
                            }
                            helperText={
                              touched.contactPerson && errors.contactPerson
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            variant="filled"
                            type="text"
                            label="Phone Number"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.phoneNumber}
                            name="phoneNumber"
                            error={!!touched.phoneNumber && !!errors.phoneNumber}
                            helperText={touched.phoneNumber && errors.phoneNumber}
                            sx={{ flexGrow: 1 }}
                          />
                        </Box>
                        <Box display="flex" gap={3}>
                          <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Tin Number"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.tinNumber}
                            name="tinNumber"
                            error={!!touched.tinNumber && !!errors.tinNumber}
                            helperText={touched.tinNumber && errors.tinNumber}
                            sx={{ gridColumn: "span 4" }}
                          />
                          <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Email"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.email}
                            name="email"
                            error={!!touched.email && !!errors.email}
                            helperText={touched.email && errors.email}
                            sx={{ gridColumn: "span 4" }}
                          />
                        </Box>

                        <Box
                          backgroundColor={colors.primary[800]}
                          borderRadius="4px"
                          px={5}
                        >
                          <Grid container spacing={2} direction="column">
                            <MyTable />
                            <FileUploader />
                          </Grid>
                        </Box>
                        <Box display="flex" gap={3}>
                          <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Full Payment"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.fullPayment}
                            name="fullPayment"
                            error={!!touched.fullPayment && !!errors.fullPayment}
                            helperText={touched.fullPayment && errors.fullPayment}
                            sx={{ gridColumn: "span 4" }}
                          />
                          <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Advance Payment"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.advancePayment}
                            name="advancePayment"
                            error={
                              !!touched.advancePayment && !!errors.advancePayment
                            }
                            helperText={
                              touched.advancePayment && errors.advancePayment
                            }
                            sx={{ gridColumn: "span 4" }}
                          />
                          <TextField
                            fullWidth
                            variant="filled"
                            type="text"
                            label="Remaining Payment"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.fullPayment - values.advancePayment}
                            name="remainingPayment"
                            error={
                              !!touched.remainingPayment &&
                              !!errors.remainingPayment
                            }
                            helperText={
                              touched.remainingPayment && errors.remainingPayment
                            }
                            sx={{ gridColumn: "span 4" }}
                          />
                        </Box>
                        <TextField
                          width="50%"
                          type="Date"
                          label="Delivery Date"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.deliveryDate}
                          name="deliveryDate"
                          error={!!touched.deliveryDate && !!errors.deliveryDate}
                          helperText={touched.deliveryDate && errors.deliveryDate}
                          sx={{ gridColumn: "span 4" }}
                        />
                        <Box display="flex" gap={3}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Designer
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={
                                values.designedBy === null ? "" : values.designedBy
                              }
                              label="Designer"
                              name="designedBy"
                              onChange={handleChange}
                            >
                              {DUdata ? (
                                DUdata.AllDesigners.map((designer, index) => (
                                  <MenuItem key={index} value={designer.id}>
                                    {designer.fullName}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem value={null}>Loading...</MenuItem>
                              )}
                              <MenuItem value={null}>None</MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Workshop
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={
                                values.workShop === null ? "" : values.workShop
                              }
                              label="Work Shop"
                              name="workShop"
                              onChange={handleChange}
                            >
                              {WUdata ? (
                                WUdata.AllWorkshops.map((workshop, index) => (
                                  <MenuItem key={index} value={workshop.id}>
                                    {workshop.fullName}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem value="">Loading...</MenuItem>
                              )}
                              <MenuItem value={null}>None</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                      <Box display="flex" justifyContent="end" mt="20px">
                        <LoadingButton
                          type="submit"
                          color="secondary"
                          variant="contained"
                          sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            padding: "10px 90px",
                          }}
                          loading={loading}
                          loadingPosition="start"
                        >
                          Place Order
                        </LoadingButton>
                      </Box>
                    </form>
                  );
                }}
              </Formik>
            </Box>
          </>
        ) : (
          <></>
        )}
      </Box>
    );
  }
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address1: yup.string().required("required"),
  address2: yup.string().required("required"),
});
const initialValues = {
  contactPerson: "",
  phoneNumber: "",
  fullPayment: "",
  advancePayment: "",
  remainingPayment: "",
  deliveryDate: "",
  files: "",
  services: "",
  email: "",
  tinNumber: "",
  customerName: "",
  designedBy: null,
  workShop: null,
};

function MyTable() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [service, setService] = useState("");
  const { setServicesList, servicesList } = useContext(SidebarCtx);
  const services = useStoreState((state) => state.allServices.services);

  // const { data, loading, error } = useQuery(AllServices);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setService("");
  };

  const handleFormSubmit = (value) => {
    value.service = service.id;
    // Calculate total price: unitPrice * quantity
    value.totalPrice = value.unitPrice * value.quantity;
    const pused = [...rows];
    pused.push(value);
    console.log(rows);
    // console.log(data);
    setRows(pused);
    setServicesList(pused);
    setOpen(false);
  };

  useEffect(() => {
    if (servicesList.length === 0 && rows.length > 0) {
      setRows([]);
      setService("");
    }
  }, [servicesList]);

  return (
    <Grid item xs={6} my={2}>
      <Box display="flex" gap={3} mb={2}>
        <Typography fontSize={20}>Services</Typography>
        <Button
          type="button"
          color="secondary"
          variant="contained"
          onClick={handleClickOpen}
        >
          add service
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Job Description</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>UnitPrice</TableCell>
              <TableCell>TotalPrice</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {services.find((v) => v.id === row.service).name}
                </TableCell>
                <TableCell align="right">{row.jobDescription}</TableCell>
                <TableCell align="right">{row.material}</TableCell>
                <TableCell align="right">{row.size}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row.unitPrice}</TableCell>
                <TableCell align="right">{row.totalPrice}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="Remove"
                    onClick={(e) => {
                      var v = rows.filter((row) => {
                        return row !== rows[index];
                      });
                      setRows(v);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>Add Service</DialogTitle>
        <DialogContent>
          {service.descriptionGuideLine && (
            <Typography fontSize={15}>
              {service?.descriptionGuideLine}
            </Typography>
          )}
          {service && (
            <Stack direction="row" gap={2}>
              <Typography my={1} fontSize={15}>
                Designer:- {service?.goseToDesigner ? "Yes" : "No"}
              </Typography>
              <Typography my={1} fontSize={15}>
                Workshop:-{service?.GoseToWorkshop ? "Yes" : "No"}
              </Typography>
            </Stack>
          )}

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={{
              jobDescription: "",
              material: "",
              size: "",
              quantity: "",
              unitPrice: "",
              totalPrice: 0,
            }}
            validationSchema={serviceSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="Column" gap={2}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Service
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={service}
                      label="Service"
                      onChange={(e) => setService(e.target.value)}
                    >
                      <MenuItem value="">Select Services</MenuItem>
                      {services ? (
                        services.map((item, index) => (
                          <MenuItem key={index} value={item}>
                            {item.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="">Select Services</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <TextField
                    autoFocus
                    name="jobDescription"
                    label="Job Description"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.jobDescription}
                    multiline
                    fullWidth
                    rows={4}
                    // defaultValue="Default Value"
                    error={!!touched.jobDescription && !!errors.jobDescription}
                    helperText={touched.jobDescription && errors.jobDescription}
                  />
                  <TextField
                    autoFocus
                    name="material"
                    label="Material"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.material}
                    fullWidth
                    variant="standard"
                    error={!!touched.material && !!errors.material}
                    helperText={touched.material && errors.material}
                  />
                  <TextField
                    autoFocus
                    name="size"
                    label="Size"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.size}
                    fullWidth
                    variant="standard"
                    error={!!touched.size && !!errors.size}
                    helperText={touched.size && errors.size}
                  />
                  <TextField
                    autoFocus
                    name="quantity"
                    label="Quantity"
                    type="number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.quantity}
                    fullWidth
                    variant="standard"
                    error={!!touched.quantity && !!errors.quantity}
                    helperText={touched.quantity && errors.quantity}
                  />
                  <TextField
                    autoFocus
                    name="unitPrice"
                    label="Unit Price"
                    type="number"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      // Auto calculate total price
                      const qty = values.quantity || 0;
                      const price = e.target.value || 0;
                      setFieldValue("totalPrice", qty * price);
                    }}
                    value={values.unitPrice}
                    fullWidth
                    variant="standard"
                    error={!!touched.unitPrice && !!errors.unitPrice}
                    helperText={touched.unitPrice && errors.unitPrice}
                  />
                  <TextField
                    autoFocus
                    disabled
                    name="totalPrice"
                    label="Total Price (Auto-calculated)"
                    type="number"
                    value={values.quantity * values.unitPrice || 0}
                    fullWidth
                    variant="standard"
                  />
                  <DialogActions>
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button type="Submit" color="secondary" variant="contained">
                      Add Service
                    </Button>
                  </DialogActions>
                </Box>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Grid >
  );
}

function FileUploader() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [forWho, setForWho] = useState("Designer");
  const [filesID, setFilesId] = useState([]);
  const { setFilesList, filesList } = useContext(SidebarCtx);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onUploadProgress = (progressEvent) => {
    const { loaded, total } = progressEvent;
    let percent = Math.floor((loaded * 100) / total);
    if (percent < 100) {
      console.log(`${loaded} bytes of ${total} bytes. ${percent}%`);
    }
  };

  const handleFormSubmit = (values) => {
    values.for = forWho;
    values.file = file;
    const filess = files;
    filess.push(values);
    setFiles(filess);
    console.log(files);
    setFile(null);
    const formData = new FormData();
    for (let value in values) {
      formData.append(value, values[value]);
    }

    axios
      .post("https://api.mekdesprinting.com/fileUpload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem("token"),
        },
        onUploadProgress,
      })
      .then((res) => {
        console.log(res.data);
        const p = filesID;
        p.push(res.data.data._id);
        setFilesId(p);
      });
    setOpen(false);
  };

  useEffect(() => {
    setFilesList(filesID);
  }, [filesID]);
  useEffect(() => {
    console.log("filesList", filesList);
    if (filesList.length == 0 && files.length > 0) {
      setFiles([]);
      setFilesId([]);
    }
  }, [filesList]);

  return (
    <Grid item xs={6} my={2}>
      <Box display="flex" gap={3} mb={2}>
        <Typography fontSize={20}>Files</Typography>
        <Button
          type="button"
          color="secondary"
          variant="contained"
          onClick={handleClickOpen}
        >
          Add file
        </Button>
      </Box>
      <Box bgcolor={colors.primary[400]}>
        <Grid container spacing={1}>
          {files.map((v, index) => (
            <Grid key={index} item>
              <Box display="flex" gap={1} m={1}>
                <MuiFileInput
                  placeholder="Insert a file"
                  value={v.file}
                  disabled
                />
                <Typography fontSize={20} alignSelf="center">
                  For: {v.for}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>Add Service</DialogTitle>
        <DialogContent>
          <Typography my={1}></Typography>

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={{
              description: "",
            }}
          // validationSchema={checkoutSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="Column" gap={2}>
                  <MuiFileInput
                    placeholder="Insert a file"
                    value={file}
                    onChange={(e) => setFile(e)}
                  />
                  <TextField
                    autoFocus
                    name="description"
                    label="Description"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.jobDescription}
                    multiline
                    fullWidth
                    rows={4}
                  // defaultValue="Default Value"
                  />
                  <FormControl>
                    <Typography>This File is Four</Typography>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="Designer"
                      name="radio-buttons-group"
                      value={forWho}
                      onChange={(e) => setForWho(e.target.value)}
                    >
                      <FormControlLabel
                        value="Designer"
                        control={<Radio />}
                        label="Designer"
                      />
                      <FormControlLabel
                        value="Workshop"
                        control={<Radio />}
                        label="Workshop"
                      />
                      <FormControlLabel
                        value="Both"
                        control={<Radio />}
                        label="Both"
                      />
                    </RadioGroup>
                  </FormControl>
                  <DialogActions>
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button type="Submit" color="secondary" variant="contained">
                      Add file
                    </Button>
                  </DialogActions>
                </Box>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}

export default Dashboard;


import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { Box, Button, TextField, Alert } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import {
  ReceptionForgotPassword,
  ReceptionSendOtp,
  DesignerSendOtp,
  DesignerForgotPassword,
  WorkShopForgotPassword,
  WorkShopSendOtp,
  ManagerForgotPassword,
  ManagerSendOtp,
  InventoryClerkSendOtp,
  InventoryClerkForgotPassword,
  AccountantForgotPassword,
  AccountantSendOtp,
  CashierForgotPassword,
  CashierSendOtp,
  SuperAdminSendOtp,
  SuperAdminForgotPassword,
} from "../../graphql/mutation";

const ForgotPassword = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const location = useLocation();
  const navigate = useNavigate();
  const { from } = location.state;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSend, setOtpSend] = useState(false);

  const loginUserType = (from) => {
    switch (from) {
      case "Reception":
        return {
          sendOtp: ReceptionSendOtp,
          forgotPassword: ReceptionForgotPassword,
        };
      case "Cashier":
        return {
          sendOtp: CashierSendOtp,
          forgotPassword: CashierForgotPassword,
        };
      case "Designer":
        return {
          sendOtp: DesignerSendOtp,
          forgotPassword: DesignerForgotPassword,
        };
      case "WorkShop":
        return {
          sendOtp: WorkShopSendOtp,
          forgotPassword: WorkShopForgotPassword,
        };
      case "Manager":
        return {
          sendOtp: ManagerSendOtp,
          forgotPassword: ManagerForgotPassword,
        };
      case "Accountant":
        return {
          sendOtp: AccountantSendOtp,
          forgotPassword: AccountantForgotPassword,
        };
      case "InventoryClerk":
        return {
          sendOtp: InventoryClerkSendOtp,
          forgotPassword: InventoryClerkForgotPassword,
        };
      case "SuperAdmin":
        return {
          sendOtp: SuperAdminSendOtp,
          forgotPassword: SuperAdminForgotPassword,
        };
      default:
        break;
    }
  };

  const [
    SendOtp,
    { data: sendOtpData, loading: sendOtpLoading, error: sendOtpError },
  ] = useMutation(loginUserType(from).sendOtp);
  const [forgotPassword, { data, loading, error }] = useMutation(
    loginUserType(from).forgotPassword
  );

  const sendCode = (values, setPhoneNumber) => {
    // console.log(values.phoneNumber);
    setPhoneNumber(values.phoneNumber);
    SendOtp({
      variables: {
        phoneNumber: Number(values.phoneNumber),
      },
    });
    values.phoneNumber = "";
  };

  const reSetPassword = (values) => {
    forgotPassword({
      variables: {
        phoneNumber: Number(phoneNumber),
        otp: Number(values.otp),
        password: values.password,
        confirmPassword: values.password,
      },
    });
  };

  useEffect(() => {
    console.log(phoneNumber);
    if (sendOtpData) {
      if (sendOtpData[`${from}SendOtp`]) {
        setOtpSend(true);
      }
    }
    if (data) {
      navigate("/");
    }
    if (error) console.log(error.networkError.result.errors[0].message);
  }, [sendOtpData, data, error]);

  return !otpSend ? (
    <Box mt={10} p={2} minWidth={200} maxWidth={500} mx="auto">
      <Header title="Forget password" subtitle="Enter your phone number" />
      {sendOtpError ? (
        <Box mb={2}>
          <Alert severity="error">
            {sendOtpError.networkError.result.errors[0].message}
          </Alert>
        </Box>
      ) : (
        <Box></Box>
      )}
      <Formik
        onSubmit={(values) => sendCode(values, setPhoneNumber)}
        initialValues={PhoneNumberInitialValues}
        validationSchema={checkoutSchema}
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
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Phone Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phoneNumber}
                name="phoneNumber"
                error={!!touched.phoneNumber && !!errors.phoneNumber}
                helperText={touched.phoneNumber && errors.phoneNumber}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 80px",
                  mt: "15px",
                }}
              >
                Send Code
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  ) : (
    <Box mt={10} p={2} minWidth={200} maxWidth={500} mx="auto">
      <Header title="Change password" subtitle="Enter verification code" />
      {error ? (
        <Box mb={2}>
          <Alert severity="error">
            {error.networkError.result.errors[0].message}
          </Alert>
        </Box>
      ) : (
        <Box></Box>
      )}
      <Formik onSubmit={reSetPassword} initialValues={InitialValues}>
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Verification code"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.otp}
                name="otp"
                error={!!touched.otp && !!errors.otp}
                helperText={touched.otp && errors.otp}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirmPassword}
                name="confirmPassword"
                error={!!touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 80px",
                  mt: "15px",
                }}
              >
                Change Password
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
});
const PhoneNumberInitialValues = {
  phoneNumber: "",
};
const InitialValues = {
  otp: "",
  password: "",
  confirmPassword: "",
};

export default ForgotPassword;

// const Contacts = () => {

//   return ();
// };

// export default Contacts;

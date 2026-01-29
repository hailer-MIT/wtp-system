import { useEffect, useContext, useState } from "react";
import Header from "./Header";
import { Box, TextField, Alert, IconButton, InputAdornment } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { SidebarCtx } from "../context";
import LoadingButton from "@mui/lab/LoadingButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


const Login = (props) => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const navigate = useNavigate();
  const { loggedIn, setLoggedIn } = useContext(SidebarCtx);
  const [showPassword, setShowPassword] = useState(false);
  const [LoginToAccount, { data, loading, error }] = useMutation(
    props?.mutation?.login
  );

  const handleLogin = (values) => {
    // console.log(values);
    LoginToAccount({
      variables: {
        phoneNumber: Number(values?.phoneNumber),
        password: values?.password,
      },
    });
  };

  useEffect(() => {
    // if (error) console.log(error.networkError.result.errors[0].message)
    setLoggedIn(false);
    if (data) {
      if (!data[`${props?.user}Login`]?.deactivated) {
        const userData = data[`${props?.user}Login`];
        localStorage.setItem("token", userData?.token);
        localStorage.setItem("user", props?.user);
        localStorage.setItem("name", userData?.fullName || "");
        localStorage.setItem("id", userData?.id || "");
        localStorage.setItem("phoneNumber", userData?.phoneNumber ? `0${userData.phoneNumber}` : "");
        localStorage.setItem("photo", userData?.photo || "");
        // console.log(localStorage.getItem('token'))
        // console.log(data)
        setLoggedIn(true);
        navigate("/dashboard");
      }
    }
  }, [data, error, navigate]);

  return (
    <Box px={5}>
      <Header title={props?.user} subtitle="Login to your account" />
      {error ? (
        <Box mb={2}>
          <Alert severity="error">
            {error?.networkError?.result?error?.networkError?.result?.errors[0]?.message:"error"} 
          </Alert>
        </Box>
      ) : (
        <Box></Box>
      )}
      <Formik
        onSubmit={handleLogin}
        initialValues={initialValues}
        validationSchema={loginSchema}
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
                value={values?.phoneNumber}
                name="phoneNumber"
                error={!!touched?.phoneNumber && !!errors?.phoneNumber}
                helperText={touched?.phoneNumber && errors?.phoneNumber}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? "text" : "password"}
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values?.password}
                name="password"
                error={!!touched?.password && !!errors?.password}
                helperText={touched?.password && errors?.password}
                sx={{ gridColumn: "span 4" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box mt="3px" display="flex" justifyContent="end">
              <Link
                style={{ textDecoration: "none" }}
                to="/ForgotPassword"
                state={{ from: props?.user }}
              >
                <Header subtitle="Forgot password" />{" "}
              </Link>
            </Box>
            <Box display="flex" justifyContent="center">
              {/* <Button  type="submit" color="secondary" variant="contained" sx={{
                fontSize: "18px",
                fontWeight: "bold",
                padding: "10px 90px",
                }}>
                LOGIN
              </Button> */}
              <LoadingButton
                type="submit"
                color="secondary"
                variant="contained"
                sx={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  padding: "10px 90px",
                }}
                loading={loading}
                loadingPosition="start"
              >
                <span>LOGIN</span>
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const loginSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  password: yup.string().required("required"),
});
const initialValues = {
  phoneNumber: "",
  password: "",
};

export default Login;

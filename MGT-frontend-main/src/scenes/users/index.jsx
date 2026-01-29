import { Box, Typography, useTheme, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import { tokens } from "../../theme";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { useQuery, useMutation } from "@apollo/client";
import { GetAllUsers } from "../../graphql/query";
import { AddUser, ActivateOrDeactivateUser } from "../../graphql/mutation";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import BrushIcon from "@mui/icons-material/Brush";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import { useStoreActions } from "easy-peasy";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const setSnackbar = useStoreActions(
    (actions) => actions.snackbar.setSnackbar
  );
  const { data, loading, error, refetch } = useQuery(GetAllUsers);
  const [addUser, { data: Udata, loading: Uloading, error: Uerror }] =
    useMutation(AddUser);
  const [
    activateOrDeactivateUser,
    { data: ADdata, loading: ADloading, error: ADerror },
  ] = useMutation(ActivateOrDeactivateUser);

  useEffect(() => {
    if (Udata) {
      refetch();
      setOpen(false);
    }
  }, [Udata]);

  const handleFormSubmit = (values) => {
    console.log(values);
    values.phoneNumber = Number(values.phoneNumber);
    addUser({
      variables: values,
    }).then(() => setOpen(false));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleActivateOrDeactivateUser = (userId, role) => {
    activateOrDeactivateUser({
      variables: {
        userId: userId,
        role: role,
      },
    }).then(() => {
      refetch();
      setSnackbar({
        openSnackbar: true,
        severity: "success",
        message: "Completed",
      });
    });
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "fullName",
      headerName: "Full Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      type: "number",
      headerAlign: "left",
      align: "left",
      valueFormatter: ({ value }) => `0${value}`,
    },
    {
      field: "deactivated",
      headerName: "Deactivated",
      flex: 1,
      renderCell: ({ row: { deactivated, id, role } }) => {
        return (
          <Box p="5px" display="flex" justifyContent="center">
            <Checkbox
              checked={deactivated}
              disabled={ADloading}
              onChange={(e) => handleActivateOrDeactivateUser(id, role)}
            />
          </Box>
        );
      },
    },

    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[600]
                : role === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "Reception" && <SupportAgentIcon />}
            {role === "Cashier" && <LocalAtmIcon />}
            {role === "Manager" && <SecurityOutlinedIcon />}
            {role === "WorkShop" && <FactoryIcon />}
            {role === "Designer" && <BrushIcon />}
            {role === "Accountant" && <AttachMoneyIcon />}
            {role === "InventoryClerk" && <InventoryIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Users" subtitle="Managing the Team Members" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={handleClickOpen}
          >
            {/* <DownloadOutlinedIcon sx={{ mr: "10px" }} /> */}
            Add User
          </Button>
        </Box>
      </Box>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          autoPageSize
          rows={data ? data.GetAllUsers : []}
          loading={loading}
          columns={columns}
          pagination
        />
      </Box>
      <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>Add Service</DialogTitle>
        <DialogContent>
          <Typography my={1}></Typography>

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={{
              fullName: "",
              phoneNumber: "",
              role: "",
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
                  <TextField
                    autoFocus
                    name="fullName"
                    label="Full Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.fullName}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                  />
                  <TextField
                    autoFocus
                    name="phoneNumber"
                    label="Phone Number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phoneNumber}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                  />
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Role</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={values.role}
                      label="Role"
                      name="role"
                      onChange={handleChange}
                    >
                      <MenuItem value="Reception">Reception</MenuItem>
                      <MenuItem value="Designer">Designer</MenuItem>
                      <MenuItem value="WorkShop">WorkShop</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="InventoryClerk">
                        Inventory Clerk
                      </MenuItem>
                      <MenuItem value="Cashier">Cashier</MenuItem>
                      <MenuItem value="Accountant">Accountant</MenuItem>
                    </Select>
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
                      Add User
                    </Button>
                  </DialogActions>
                </Box>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Users;

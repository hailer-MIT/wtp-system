import {
  Box,
  Typography,
  useTheme,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid, GridCellEditStopReasons } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useQuery, useMutation } from "@apollo/client";
import { AllServices } from "../../graphql/query";
import {
  AddServices,
  ChangeGoesToWorkshop,
  ChangeGoesToDesigner,
  DeleteService,
} from "../../graphql/mutation";

import { useEffect, useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import { useStoreActions } from "easy-peasy";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

const Service = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [cp, setCp] = useState("");
  const { data, loading, error, refetch } = useQuery(AllServices);
  const { setServices, setSnackbar } = useStoreActions((actions) => ({
    setServices: actions.allServices.setServices,
    setSnackbar: actions.snackbar.setSnackbar,
  }));

  const [addServices, { data: Sdata, loading: Sloading, error: Serror }] =
    useMutation(AddServices);
  const [
    changeGoesToWorkshop,
    { data: Wdata, loading: Wloading, error: Werror },
  ] = useMutation(ChangeGoesToWorkshop);
  const [
    changeGoesToDesigner,
    { data: Ddata, loading: Dloading, error: Derror },
  ] = useMutation(ChangeGoesToDesigner);
  const [deleteService, { data: SDdata, loading: SDloading, error: SDerror }] =
    useMutation(DeleteService);

  useEffect(() => {
    if (data) setServices(data?.AllServices);
    if (Sdata) {
      refetch();
      setOpen(false);
    }
  }, [Sdata, data]);

  const handleFormSubmit = (values) => {
    console.log(values);
    addServices({
      variables: values,
    }).then((e) =>
      setSnackbar({
        openSnackbar: true,
        message: "Service Added",
        severity: "success",
      })
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "name",
      headerName: "Name",
      cellClassName: "name-column--cell",
      flex: 1,
      editable: true,
    },
    {
      field: "descriptionGuideLine",
      headerName: "Guide Line",
      headerAlign: "left",
      align: "left",
      flex: 1,
      editable: true,
    },
    {
      field: "goseToDesigner",
      headerName: "Goes To Designer",
      flex: 0.5,
      renderCell: (value) => {
        return (
          <Box
            p="5px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={3}
          >
            <Checkbox
              checked={value.row.goseToDesigner}
              // disabled={ADloading}
              // onChange={(e) => handleActivateOrDeactivateUser(id, role)}
              onChange={(e) => {
                setCp(`D${value?.row?.id}`);
                changeGoesToDesigner({
                  variables: {
                    serviceId: value?.row?.id,
                    value: !value.row.goseToDesigner,
                  },
                }).then((v) => {
                  refetch();
                });
              }}
            />
            {Dloading && cp == `D${value?.row?.id}` && (
              <CircularProgress color="secondary" size={25} />
            )}
          </Box>
        );
      },
    },

    {
      field: "GoseToWorkshop",
      headerName: "Goes To Workshop",
      flex: 0.5,
      renderCell: (value) => {
        return (
          <Box
            p="5px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={3}
          >
            <Checkbox
              checked={value.row.GoseToWorkshop}
              // disabled={ADloading}
              // onChange={(e) => handleActivateOrDeactivateUser(id, role)}
              onChange={(e) => {
                setCp(`W${value?.row?.id}`);
                changeGoesToWorkshop({
                  variables: {
                    serviceId: value?.row?.id,
                    value: !value.row.GoseToWorkshop,
                  },
                }).then((v) => {
                  refetch();
                });
              }}
            />
            {Wloading && cp == `W${value?.row?.id}` && (
              <CircularProgress color="secondary" size={25} />
            )}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.3,
      renderCell: (value) => {
        return (
          <Box
            p="5px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={3}
          >
            <IconButton
              aria-label="delete"
              size="small"
              onClick={(e) => {
                setCp(`SD${value?.row?.id}`);
                deleteService({
                  variables: {
                    serviceId: value?.row?.id,
                  },
                }).then((e) => {
                  refetch();
                  setSnackbar({
                    openSnackbar: true,
                    message: "Service deleted",
                    severity: "success",
                  });
                });
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            {SDloading && cp == `SD${value?.row?.id}` && (
              <CircularProgress color="secondary" size={25} />
            )}
          </Box>
        );
      },
    },
  ];

  const processRowUpdate = useCallback(
    async (newRow) => {
      // Make the HTTP request to save in the backend
      return console.log(newRow)
      // setSnackbar({ children: 'User successfully saved', severity: 'success' });
      // return response;
    },[]
  );


  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Service" subtitle="Managing Services" />
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
            Add Service
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
          editMode="row"
          processRowUpdate={processRowUpdate}
          rows={data ? data.AllServices : []}
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
              name: "",
              descriptionGuideLine: "",
              goseToDesigner: false,
              goseToWorkshop: false,
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
                    name="name"
                    label="Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                  />
                  <TextField
                    autoFocus
                    name="descriptionGuideLine"
                    label="Guide Line"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.descriptionGuideLine}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                  />
                  <FormControlLabel
                    label="Goes To Designer"
                    control={
                      <Checkbox
                        checked={values.goseToDesigner}
                        onChange={handleChange}
                        name="goseToDesigner"
                        color="success"
                      />
                    }
                  />
                  <FormControlLabel
                    label="Goes To Workshop"
                    control={
                      <Checkbox
                        checked={values.GoseToWorkshop}
                        onChange={handleChange}
                        name="goseToWorkshop"
                        color="success"
                      />
                    }
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
                      Add service
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

export default Service;

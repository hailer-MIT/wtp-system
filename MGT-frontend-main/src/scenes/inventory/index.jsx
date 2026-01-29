import { Box, Typography, useTheme, Button, TextField } from "@mui/material";
import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useQuery, useMutation } from "@apollo/client";
import { InventoryGetAssets, InventoryHistory } from "../../graphql/query";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import {
  InventoryAddNewItem,
  InventoryAddQuantity,
  InventorySubtractQuantity,
} from "../../graphql/mutation";
import { useStoreActions } from "easy-peasy";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useEffect } from "react";
import { inventoryAddItem } from "../../yup/schema";

const Inventory = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { data, loading, error, refetch } = useQuery(InventoryGetAssets,{
    variables: {
      assetType: props.title
    }
  });
  const [open, setOpen] = useState(false);
  const [rowDialogOpen, setRowDialogOpen] = useState(false);
  const [row, setRow] = useState({});
  const [inventoryHistory, setInventoryHistory] = useState(false);
  const [addOrSubtract, setAddOrSubtract] = useState("");
  // const [assetType, setAssetType] = useState("");

  const {
    data: IHdata,
    loading: IHloading,
    error: IHerror,
    refetch: IHrefetch,
  } = useQuery(InventoryHistory, {
    variables: { itemId: row?.id },
    skip: !inventoryHistory,
  });
  const setSnackbar = useStoreActions(
    (actions) => actions.snackbar.setSnackbar
  );

  useEffect(() => {
    if (
      localStorage.getItem("user") == "InventoryClerk" ||
      localStorage.getItem("user") == "Manager" ||
      localStorage.getItem("user") == "SuperAdmin"
    )
    // console.log(data,loading,error)
      setInventoryHistory(true);
    if (inventoryHistory) IHrefetch();
    console.log(IHdata);
  }, [inventoryHistory]);

  const [
    inventoryAddNewItem,
    { data: Idata, loading: Iloading, error: Ierror },
  ] = useMutation(InventoryAddNewItem);
  const [
    inventoryAddQuantity,
    { data: AQdata, loading: AQloading, error: AQerror },
  ] = useMutation(InventoryAddQuantity);
  const [
    inventorySubtractQuantity,
    { data: SQdata, loading: SQloading, error: SQerror },
  ] = useMutation(InventorySubtractQuantity);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleRowClickOpen = (params) => {
    setRow(params.row);
    setRowDialogOpen(true);
  };

  const handleRowClose = () => {
    setRowDialogOpen(false);
  };

  const handleFormSubmit = (values) => {
    values.quantity = Number(values.quantity);
    values.assetType = props.title;
    inventoryAddNewItem({
      variables: values,
    }).then(() => {
      refetch();
      setSnackbar({
        openSnackbar: true,
        severity: "success",
        message: "Item Created successfully",
      });
      setOpen(false);
    });
  };
  const handleAddOrSubtractQuantity = (values, id) => {
    values.quantity = Number(values.quantity);
    console.log(addOrSubtract);
    if (addOrSubtract == "add")
      inventoryAddQuantity({
        variables: {
          itemId: id,
          quantity: values.quantity,
        },
      }).then(() => {
        refetch();
        setSnackbar({
          openSnackbar: true,
          severity: "success",
          message: "Quantity Added successfully",
        });
        setRowDialogOpen(false);
        console.log(AQdata);
        IHrefetch();
      });
    if (addOrSubtract == "subtract")
      inventorySubtractQuantity({
        variables: {
          itemId: id,
          quantity: values.quantity,
        },
      }).then(() => {
        refetch();
        setSnackbar({
          openSnackbar: true,
          severity: "success",
          message: "Quantity subtracted successfully",
        });
        setRowDialogOpen(false);
        console.log(SQdata);
        IHrefetch();
      });
  };

  const columns = [
    { field: "itemCode", headerName: "Item Code" },
    {
      field: "itemName",
      headerName: "Item Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "size",
      headerName: "Size",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "thickness",
      headerName: "Thickness",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "color",
      headerName: "Color",
      flex: 1,
    },
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      renderCell: (params) => (
        <Typography
          fontSize={18}
          fontWeight="bold"
          color={
            params.row.quantity > 10 ? colors.greenAccent[500] : colors.red[100]
          }
        >
          {params.row.quantity}
        </Typography>
      ),
    },
  ];
  const columns2 = [
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "operation",
      headerName: "Operation",
      flex: 1,
      renderCell: (params) => (
        <Typography
          fontSize={18}
          fontWeight="bold"
          color={
            params.row.operation == "ADD"
              ? colors.greenAccent[500]
              : colors.red[100]
          }
        >
          {params.row.operation}
        </Typography>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={`${props.title} Assets`} subtitle={`List of ${props.title}`} />
        {(localStorage.getItem("user") == "SuperAdmin" ||
          localStorage.getItem("user") == "Accountant") && (
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
              Create {props.title} Assets
            </Button>
          </Box>
        )}
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
          rows={data ? data?.InventoryGetAssets : []}
          loading={loading}
          columns={columns}
          pagination
          onRowClick={
            localStorage.getItem("user") == "SuperAdmin" ||
            localStorage.getItem("user") == "Manager" ||
            localStorage.getItem("user") == "InventoryClerk"
              ? handleRowClickOpen
              : () => console.log("")
          }
        />
      </Box>
      <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <Typography my={1}></Typography>

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={{
              itemName: "",
              color: "",
              quantity: "",
            }}
            validationSchema={inventoryAddItem}
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
                    name="itemCode"
                    label="Item Code"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.itemCode}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.itemCode && !!errors?.itemCode}
                    helperText={touched?.itemCode && errors?.itemCode}
                  />
                  <TextField
                    autoFocus
                    name="itemName"
                    label="Item Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.itemName}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.itemName && !!errors?.itemName}
                    helperText={touched?.itemName && errors?.itemName}
                  />
                  <TextField
                    autoFocus
                    name="unit"
                    label="Unit"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.unit}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.unit && !!errors?.unit}
                    helperText={touched?.unit && errors?.unit}
                  />
                  <TextField
                    autoFocus
                    name="size"
                    label="Size"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.size}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.size && !!errors?.size}
                    helperText={touched?.size && errors?.size}
                  />
                  <TextField
                    autoFocus
                    name="thickness"
                    label="Thickness"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.thickness}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.thickness && !!errors?.thickness}
                    helperText={touched?.thickness && errors?.thickness}
                  />
                  <TextField
                    autoFocus
                    name="color"
                    label="Color"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.color}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.color && !!errors?.color}
                    helperText={touched?.color && errors?.color}
                  />
                  <TextField
                    autoFocus
                    name="serialNumber"
                    label="S.No"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.serialNumber}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.serialNumber && !!errors?.serialNumber}
                    helperText={touched?.serialNumber && errors?.serialNumber}
                  />
                  <TextField
                    autoFocus
                    name="type"
                    label="Type"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phoneNumber}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.type && !!errors?.type}
                    helperText={touched?.type && errors?.type}
                  />
                  <TextField
                    autoFocus
                    name="quantity"
                    label="Quantity"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phoneNumber}
                    // multiline
                    fullWidth
                    // defaultValue="Default Value"
                    error={!!touched?.quantity && !!errors?.quantity}
                    helperText={touched?.quantity && errors?.quantity}
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
                      Add Item
                    </Button>
                  </DialogActions>
                </Box>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={rowDialogOpen}
        onClose={handleRowClose}
      >
        <DialogTitle>
          {localStorage.getItem("user") == "InventoryClerk"
            ? "Add or subtract"
            : "History"}
        </DialogTitle>
        <DialogContent>
          <Typography my={1}></Typography>

          <Formik
            onSubmit={(values) => handleAddOrSubtractQuantity(values, row.id)}
            initialValues={{
              quantity: "",
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
                  {localStorage.getItem("user") == "InventoryClerk" && (
                    <>
                      <FormControl>
                        {/* <Typography>This File is Four</Typography> */}
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          defaultValue="Designer"
                          name="radio-buttons-group"
                          value={addOrSubtract}
                          onChange={(e) => setAddOrSubtract(e.target.value)}
                        >
                          <FormControlLabel
                            value="subtract"
                            control={<Radio color="secondary" />}
                            label="Subtract (-)"
                          />
                          <FormControlLabel
                            value="add"
                            control={<Radio color="secondary" />}
                            label="Add (+)"
                          />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        autoFocus
                        name="quantity"
                        label="Quantity"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.quantity}
                        // multiline
                        fullWidth
                        // defaultValue="Default Value"
                      />
                    </>
                  )}
                  {inventoryHistory && (
                    <Box height="400px">
                      <DataGrid
                        autoPageSize
                        rows={IHdata ? IHdata.InventoryHistory : []}
                        loading={IHloading}
                        columns={columns2}
                        pagination
                      />
                    </Box>
                  )}

                  <DialogActions>
                    {localStorage.getItem("user") == "InventoryClerk" && (
                      <FormControlLabel
                        control={
                          <Switch
                            color="secondary"
                            checked={inventoryHistory}
                            onChange={(e) =>
                              setInventoryHistory(e.target.checked)
                            }
                          />
                        }
                        label="Show Inventory History"
                      />
                    )}
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={handleRowClose}
                    >
                      Cancel
                    </Button>
                    {addOrSubtract == "add" ? (
                      <Button
                        type="Submit"
                        color="secondary"
                        variant="contained"
                      >
                        Add (+)
                      </Button>
                    ) : addOrSubtract == "subtract" ? (
                      <Button type="Submit" color="error" variant="contained">
                        Subtract (-)
                      </Button>
                    ) : (
                      <></>
                    )}
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

export default Inventory;

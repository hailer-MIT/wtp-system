import {
  Box,
  Button,
  Typography,
  useTheme,
  TextField,
  Grid,
  Stack,
} from "@mui/material";
// import { DatePicker } from "@mui/lab";
import LoadingButton from "@mui/lab/LoadingButton";
import { tokens } from "../../../theme";

import { Formik } from "formik";
import * as yup from "yup";

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
import { SidebarCtx } from "../../../context";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import EditIcon from "@mui/icons-material/Edit";

///file
import { MuiFileInput } from "mui-file-input";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import axios from "axios";

import { placeOrderSchema, serviceSchema } from "../../../yup/schema";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQuery } from "@apollo/client";
import { AllDesigners, AllWorkshops } from "../../../graphql/query";
import {
  OrderRemoveService,
  OrderAddService,
  OrderEditService,
  OrderEdit,
} from "../../../graphql/mutation";
import { useStoreState, useStoreActions } from "easy-peasy";

export default function EditOrder() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = localStorage.getItem("user");
  const { setServicesList, servicesList } = useContext(SidebarCtx);

  const { services, allOrderRefetch, order } = useStoreState((state) => ({
    services: state.allServices.services,
    allOrderRefetch: state.allOrders.refetch,
    order: state.allOrders.row,
  }));
  const { setOrder, setSnackbar } = useStoreActions((actions) => ({
    setOrder: actions.allOrders.setRow,
    setSnackbar: actions.snackbar.setSnackbar,
  }));

  const initialValues = {
    contactPerson: order.contactPerson,
    phoneNumber: `0${order.phoneNumber}`,
    fullPayment: order.fullPayment,
    advancePayment: order.advancePayment,
    remainingPayment: order.remainingPayment,
    deliveryDate: new Date(order.deliveryDate).toISOString().split("T")[0],
    files: order.files,
    services: order.services,
    email: order.email,
    tinNumber: order.tinNumber ? order.tinNumber : "",
    customerName: order.customerName,
    designedBy: order.designedBy,
    workShop: order.workShop,
  };
  const {
    data: DUdata,
    loading: DUloading,
    error: DUerror,
  } = useQuery(AllDesigners, {
    // skip: (user != "Reception" || user != "SuperAdmin"),
  });
  const {
    data: WUdata,
    loading: WUloading,
    error: WUerror,
  } = useQuery(AllWorkshops, {
    // skip: (user != "Reception" || user != "SuperAdmin"),
  });
  const [
    orderEdit,
    { data: EDITdata, loading: EDITloading, error: EDITerror },
  ] = useMutation(OrderEdit);
  const handleFormSubmit = async (value) => {
    console.log(value);
    delete value.services;
    delete value.files;
    value.phoneNumber = Number(value.phoneNumber);
    value.fullPayment = Number(value.fullPayment);
    value.advancePayment = Number(value.advancePayment);
    value.remainingPayment =
      Number(value.fullPayment) - Number(value.advancePayment);
    await orderEdit({
      variables: { orderId: order.id, orderInput: value },
    });
    allOrderRefetch();
    setOrder({ ...order, ...value });
    setSnackbar({
      openSnackbar: true,
      message: "Order Edited Successfuly",
      severity: "success",
    });
  };
  return (
    <Box minWidth={600} mt={3}>
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
        }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="Column" gap={3} px={10}>
              <Box display="flex" gap={3}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="CustomerName"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.customerName}
                  name="customerName"
                  error={!!touched.customerName && !!errors.customerName}
                  helperText={touched.customerName && errors.customerName}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Contact Person"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.contactPerson}
                  name="contactPerson"
                  error={!!touched.contactPerson && !!errors.contactPerson}
                  helperText={touched.contactPerson && errors.contactPerson}
                />
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
                  sx={{ gridColumn: "span 2" }}
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
                <Grid container spacing={2}>
                  <MyTable OrderId={order.id} OServices={order.services} />
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
                  error={!!touched.advancePayment && !!errors.advancePayment}
                  helperText={touched.advancePayment && errors.advancePayment}
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
                    !!touched.remainingPayment && !!errors.remainingPayment
                  }
                  helperText={
                    touched.remainingPayment && errors.remainingPayment
                  }
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>
              <TextField
                fullWidth
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
                      values.designedBy == null || DUloading
                        ? ""
                        : values.designedBy
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
                      values.workShop == null || WUloading
                        ? ""
                        : values.workShop
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
                // loading={loading}
                loadingPosition="start"
              >
                Edit Order
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
}

function MyTable({ OServices, OrderId }) {
  const [open, setOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [rows, setRows] = useState(OServices);
  const [service, setService] = useState("");
  const { setServicesList, servicesList } = useContext(SidebarCtx);
  const { services, allOrderRefetch, order } = useStoreState((state) => ({
    services: state.allServices.services,
    allOrderRefetch: state.allOrders.refetch,
    order: state.allOrders.row,
  }));
  const { setOrder, setSnackbar } = useStoreActions((actions) => ({
    setOrder: actions.allOrders.setRow,
    setSnackbar: actions.snackbar.setSnackbar,
  }));

  const [
    orderRemoveService,
    { data: REdata, loading: REloading, error: REerror },
  ] = useMutation(OrderRemoveService);
  const [
    orderAddService,
    { data: ADDdata, loading: ADDloading, error: ADDerror },
  ] = useMutation(OrderAddService);
  const [
    orderEditService,
    { data: EDITdata, loading: EDITloading, error: EDITerror },
  ] = useMutation(OrderEditService);

  // const { data, loading, error } = useQuery(AllServices);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setService("");
    setEditService(null);
  };

  const handleFormSubmit = async (value) => {
    console.log(editService?.service);
    value.service = service.id;
    const oldService = {
      service: editService?.service,
      jobDescription: editService?.jobDescription,
      material: editService?.material,
      size: editService?.size,
      quantity: editService?.quantity,
      totalPrice: editService?.totalPrice,
    };
    const editedService = {
      service: value?.service,
      jobDescription: value?.jobDescription,
      material: value?.material,
      size: value?.size,
      quantity: value?.quantity,
      totalPrice: value?.totalPrice,
    };
    editService == null
      ? await orderAddService({
          variables: { orderId: OrderId, service: value },
        })
      : await orderEditService({
          variables: {
            orderId: OrderId,
            oldService: oldService,
            editedService: editedService,
          },
        });
    if (editService == null) {
      value.service = service.id;
      setRows([...rows, value]);
      setServicesList([...rows, value]);
      setOrder({ ...order, services: [...rows, value] });
      setSnackbar({
        openSnackbar: true,
        message: "Service Added Successfuly",
        severity: "success",
      });
    } else {
      var v = rows.filter((row, index) => {
        oldService.__typename = "service";
        oldService.row = { ...row };

        console.log(row, oldService);
        console.log(row == oldService);
        if (oldService !== row) {
          return editedService;
        } else {
          return editedService;
        }
      });
      setSnackbar({
        openSnackbar: true,
        message: "Service Edited Successfuly",
        severity: "success",
      });
    }

    setOpen(false);
    setEditService(null);
    allOrderRefetch();
  };

  useEffect(() => {
    console.log("servicessss", rows);
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
              <TableCell>TotalPrice</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {services.find((v) => v.id == row.service).name}
                </TableCell>
                <TableCell align="right">{row.jobDescription}</TableCell>
                <TableCell align="right">{row.material}</TableCell>
                <TableCell align="right">{row.size}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row?.totalPrice}</TableCell>
                <TableCell align="right">
                  <Stack direction="row">
                    <IconButton
                      aria-label="Edit"
                      onClick={(e) => {
                        // row = {...row, service: services.find((v) => v.id == row.service)}

                        setService(services.find((v) => v.id == row.service));
                        setEditService(row);
                        setOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="Remove"
                      onClick={async (e) => {
                        const r = await orderRemoveService({
                          variables: {
                            orderId: OrderId,
                            service: {
                              service: row.service,
                              jobDescription: row.jobDescription,
                              material: row.material,
                              size: row.size,
                              quantity: row.quantity,
                              totalPrice: row?.totalPrice,
                            },
                          },
                        });
                        console.log(r);
                        var v = rows.filter((row) => {
                          return row !== rows[index];
                        });
                        setRows(v);
                        setOrder({ ...order, services: v });
                        allOrderRefetch();
                        setSnackbar({
                          openSnackbar: true,
                          message: "Service Removed Successfuly",
                          severity: "success",
                        });
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
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
            initialValues={
              editService == null
                ? {
                    jobDescription: "",
                    material: "",
                    size: "",
                    quantity: "",
                    totalPrice: "",
                  }
                : editService
            }
            validationSchema={serviceSchema}
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
  onChange={handleChange}
  value={values.unitPrice}
  fullWidth
  variant="standard"
  error={!!touched.unitPrice && !!errors.unitPrice}
  helperText={touched.unitPrice && errors.unitPrice}
/>
<TextField
  name="totalPrice"
  label="Total Price (calculated)"
  type="number"
  value={values.quantity && values.unitPrice ? values.quantity * values.unitPrice : ''}
  fullWidth
  variant="standard"
  InputProps={{ readOnly: true }}
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
                      {editService == null ? "Add Service" : "Edit Service"}
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

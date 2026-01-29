import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Grid,
  Typography,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ListComp from "../../components/ListComp";
import { useTheme } from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { AllOrders, AllDesigners, AllWorkshops } from "../../graphql/query";
import { ReceptionDelivereOrder, ReassignOrder } from "../../graphql/mutation";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Axios from "axios";
import FileDownload from "js-file-download";
import { useStoreState, useStoreActions } from "easy-peasy";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditOrder from "./compontes/editOrder";
import Switch from "@mui/material/Switch";

const Orders = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // const [row, setRow] = useState({});
  const [open, setOpen] = useState(false);
  const [openEditOrder, setOpenEditOrder] = useState(false);
  const [openReassign, setOpenReassign] = useState(false);
  const [reassignDesigner, setReassignDesigner] = useState("");
  const [reassignWorkshop, setReassignWorkshop] = useState("");
  const [order, setOrder] = useState();
  const [scroll, setScroll] = useState("paper");
  const [downloading, setDownloading] = useState("");
  const [options, setOptions] = useState("All");
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [], //mockDataContacts,
    total: 0,
    page: 0,
    limit: 10,
  });

  const { services, row } = useStoreState((state) => ({
    services: state.allServices.services,
    row: state.allOrders.row,
  }));
  const { setAllOrderRefetch, setRow } = useStoreActions((actions) => ({
    setAllOrderRefetch: actions.allOrders.setRefetch,
    setRow: actions.allOrders.setRow,
  }));

  const [casherDelivereOrder, { Sdata, Sloading, Serror }] = useMutation(
    ReceptionDelivereOrder
  );
  const [reassignOrderMutation] = useMutation(ReassignOrder);
  const { data: designersData } = useQuery(AllDesigners);
  const { data: workshopsData } = useQuery(AllWorkshops);

  const handleDownload = (id, extension, name) => {
    setDownloading(id);
    Axios.get(
      `https://api.mekdesprinting.com/fileDownload/${id}.${extension}`,
      {
        responseType: "blob",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    )
      .then((res) => {
        FileDownload(res.data, name);
        setDownloading("");
      })
      .catch(function (error) {
        setDownloading("");
      });
  };

  const { data, loading, error, refetch } = useQuery(AllOrders, {
    variables: {
      page: pageState.page,
      limit: pageState.limit,
      options: options.split(","),
    },
  });

  const DelivereOrder = async (progress, id) => {
    await casherDelivereOrder({
      variables: { orderId: id, progress: progress },
    });
    console.log(Sdata);
    refetch({ options: options.split(",") });
    setOpen(false);
  };

  const columns = [
    {
      field: "orderNumber",
      headerName: "Order NO.",
      flex: 0.5,
      type: "number",
      headerAlign: "center",
      align: "center",
    },
    { field: "customerName", headerName: "Customer Name" },
    {
      field: "contactPerson",
      headerName: "Contact Person",
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
      field: "orderedDate",
      headerName: "Ordered Date",
      valueFormatter: ({ value }) => {
        return new Date(value).toLocaleDateString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
      flex: 1,
    },
    {
      field: "services",
      headerName: "Services",
      flex: 1,
      valueFormatter: ({ value }) =>
        `${value.map((s) => services.find((v) => v.id == s.service).name)}`,
    },
    {
      field: "fullPayment",
      headerName: "Full Payment",
      flex: 0.5,
    },
    {
      field: "advancePayment",
      headerName: "Advance Payment",
      flex: 0.5,
    },
    {
      field: "remainingPayment",
      headerName: "Remaining Payment",
      flex: 0.5,
    },
    {
      headerName: "Progress",
      flex: 1,
      renderCell: ({ row }) => {
        // specific logic to check assignmentStatus
        if (row.assignmentStatus === "Rejected") {
          return (
            <Typography fontWeight="bold" fontSize={18} color="error">
              Rejected
            </Typography>
          );
        }
        const progress = row.progress;
        switch (progress) {
          case "Pending":
            return (
              <Typography fontWeight="bold" fontSize={18} color="red">
                {progress}
              </Typography>
            );
          case "Designing":
            return (
              <Typography fontWeight="bold" fontSize={18} color="yellow">
                {progress}
              </Typography>
            );
          case "Printing":
            return (
              <Typography fontWeight="bold" fontSize={18} color="orange">
                {progress}
              </Typography>
            );
          case "Completed":
            return (
              <Typography fontWeight="bold" fontSize={18} color="green">
                {progress}
              </Typography>
            );
          case "Delivered":
            return (
              <Typography fontWeight="bold" fontSize={18} color="white">
                {progress}
              </Typography>
            );
          case "Rejected": // Although progress might not be "Rejected", assignmentStatus is.
            // But I am switching on `progress`. 
            // Wait, fetch logic returns row.progress.
            // If I want to show Rejected, I need to check row.assignmentStatus.
            // But `renderCell` destructures `({ row: { progress } })`.
            // I should change destructuring.
            return (
              <Typography fontWeight="bold" fontSize={18} color="red">
                Rejected
              </Typography>
            );
          default:
            return (
              <Typography fontWeight="bold" fontSize={18} color="red">
                {progress}
              </Typography>
            );
        }
      },
    },
  ];

  const handleRowClick = (params) => {
    console.log(params.row);
    setRow(params.row);
    setOpen(true);
    setScroll(scroll);
  };

  const handleClose = () => {
    setOpen(false);
    setOpenEditOrder(false);
  };
  const onFilterChange = async (f) => {
    if (f && f.value) {
      await refetch({
        page: pageState.page,
        limit: pageState.limit,
        value: f.value,
        field: f.columnField,
        options: options.split(","),
      });
    } else
      await refetch({
        page: pageState.page,
        limit: pageState.limit,
        value: null,
        field: null,
        options: options.split(","),
      });
    console.log(f);
  };

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    setAllOrderRefetch(refetch);
    if (data) {
      refetch({
        page: pageState.page,
        limit: pageState.limit,
        options: options.split(","),
      });
    }
    console.log(pageState.page, pageState.limit);
  }, [pageState.page, pageState.limit, options]);
  useEffect(() => {
    setPageState((old) => ({ ...old, isLoading: true }));
    if (data) {
      setPageState((old) => ({
        ...old,
        isLoading: false,
        data: data.AllOrders.data,
        total: data.AllOrders.total,
      }));
      console.log(data);
    }
    if (error) setPageState((old) => ({ ...old, isLoading: false }));
    if (error) console.log(error.networkError.result.errors[0].message);
  }, [data, error]);

  const handleReassignOpen = () => {
    setReassignDesigner(row.designedBy || "");
    setReassignWorkshop(row.workShop || "");
    setOpenReassign(true);
  };

  const handleReassignSubmit = async () => {
    try {
      if (!row) return;

      const variables = {
        orderId: row.id,
      };
      if (reassignDesigner) variables.designedBy = reassignDesigner;
      if (reassignWorkshop) variables.workShop = reassignWorkshop;

      await reassignOrderMutation({
        variables: variables,
      });

      setOpenReassign(false);
      setOpen(false); // Close main dialog too
      await refetch(); // Refresh list to update status
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box m="20px">
      <Header title="ORDERS" subtitle="List of Orders" />
      <Box
        m="40px 0 0 0"
        height="665px"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="Designer"
            name="radio-buttons-group"
            value={options}
            onChange={(e) => {
              setOptions(e.target.value);
              console.log(e.target.value.split(","));
            }}
          >
            <FormControlLabel
              value={"All"}
              control={<Radio color="secondary" />}
              label="All"
            />
            <FormControlLabel
              value={"Pending"}
              control={<Radio color="secondary" />}
              label="Pending"
            />
            <FormControlLabel
              value={"Designing"}
              control={<Radio color="secondary" />}
              label="Designing"
            />
            <FormControlLabel
              value={"WaitingForPrint"}
              control={<Radio color="secondary" />}
              label="Waiting For Print"
            />
            <FormControlLabel
              value={"Completed"}
              control={<Radio color="secondary" />}
              label="Completed"
            />
            <FormControlLabel
              value={"Delivered"}
              control={<Radio color="secondary" />}
              label="Delivered"
            />
            <FormControlLabel
              value={"Rejected"}
              control={<Radio color="secondary" />}
              label="Rejected"
            />
          </RadioGroup>
        </FormControl>
        <LoadingButton
          color="primary"
          variant="contained"
          startIcon={<RefreshIcon />}
          loading={loading}
          loadingPosition="start"
          onClick={(e) => refetch()}
        >
          Refresh
        </LoadingButton>
        <DataGrid
          rows={pageState.data}
          rowCount={pageState.total}
          loading={loading}
          // rowsPerPageOptions={[1,2,10]}
          pagination
          page={pageState.page}
          pageSize={pageState.limit}
          paginationMode="server"
          filterMode="server"
          onFilterModelChange={(details) => onFilterChange(details.items[0])}
          onPageChange={(newPage) => {
            console.log("newpage", newPage);
            setPageState((old) => ({ ...old, page: newPage }));
          }}
          onPageSizeChange={(newPageSize) => {
            console.log("newPage size", newPageSize);
            setPageState((old) => ({ ...old, limit: newPageSize }));
          }}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            sorting: {
              sortModel: [{ field: "orderedDate", sort: "desc" }],
            },
          }}
          onRowClick={handleRowClick}
        />
      </Box>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          scroll={scroll}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          fullWidth={true}
          aria-describedby="scroll-dialog-description"
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle id="scroll-dialog-title" fontSize={20} textAlign="center">
            {!openEditOrder ? (
              <div>
                Order Details
                {localStorage.getItem("user") == "Reception" &&
                  row.progress == "Completed" && (
                    <Button
                      onClick={() => {
                        console.log(row.id);
                        DelivereOrder("Delivered", row.id);
                      }}
                      color="secondary"
                      variant="contained"
                    >
                      Delivere Order
                    </Button>
                  )}
              </div>
            ) : (
              "Edit order"
            )}
          </DialogTitle>
          {openEditOrder ? (
            <EditOrder order={row} />
          ) : (
            <DialogContent dividers={scroll === "paper"}>
              <Grid container spacing={2}>
                <ListComp
                  title="Customer Name"
                  value={row.customerName}
                  edit={row.edited}
                  editedValue={
                    row?.editedFile?.[row?.editedFile?.length - 1]?.customerName
                  }
                />
                <ListComp
                  title="Contact Person"
                  value={row.contactPerson}
                  edit={row.edited}
                  editedValue={
                    row.editedFile?.[row?.editedFile?.length - 1]?.contactPerson
                  }
                />
                <ListComp
                  title="Phone Number"
                  value={`0${row.phoneNumber}`}
                  edit={row.edited}
                  editedValue={`0${row.editedFile?.[row?.editedFile?.length - 1]?.phoneNumber
                    }`}
                />
                <ListComp
                  title="Tin Number"
                  value={row.tinNumber}
                  edit={row.edited}
                  editedValue={
                    row.editedFile?.[row?.editedFile?.length - 1]?.tinNumber
                  }
                />
                <ListComp
                  title="Email"
                  value={row.email}
                  edit={row.edited}
                  editedValue={
                    row.editedFile?.[row?.editedFile?.length - 1]?.email
                  }
                />
                <ListComp
                  title="Full Payment"
                  value={row.fullPayment}
                  edit={row.edited}
                  editedValue={
                    row.editedFile?.[row?.editedFile?.length - 1]?.fullPayment
                  }
                />
                <ListComp
                  title="Advance Payment"
                  value={row.advancePayment}
                  edit={row.edited}
                  editedValue={
                    row.editedFile?.[row?.editedFile?.length - 1]
                      ?.advancePayment
                  }
                />
                <ListComp
                  title="Remaining Payment"
                  value={row.remainingPayment}
                  edit={row.edited}
                  editedValue={
                    row.editedFile?.[row?.editedFile?.length - 1]
                      ?.remainingPayment
                  }
                />
                <ListComp
                  title="Received By"
                  value={row.ReceivedBy ? row.ReceivedBy.fullName : ""}
                />
                <ListComp
                  title="Designed By"
                  value={row.DesignedBy ? row.DesignedBy.fullName : ""}
                />
                <ListComp
                  title="WorkShop"
                  value={row.WorkShop ? row.WorkShop.fullName : ""}
                />
                <ListComp
                  title="Ordered Date"
                  value={new Date(row.orderedDate).toLocaleDateString("en-us", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                />
                <ListComp
                  title="Delivery Date"
                  value={new Date(row.deliveryDate).toLocaleDateString(
                    "en-us",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                />
                <ListComp title="Progress" value={row.progress} />
                <ListComp
                  title="Satisfaction Rate"
                  value={row.satisfactionRate}
                />
                <ListComp title="Pending Date" value={row.pendingDate ? new Date(parseInt(row.pendingDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                <ListComp title="Designing Start Date" value={row.designingStartDate ? new Date(parseInt(row.designingStartDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                <ListComp title="Designer Completed Date" value={row.designerCompletedDate ? new Date(parseInt(row.designerCompletedDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                <ListComp title="Waiting For Print Date" value={row.waitingForPrintDate ? new Date(parseInt(row.waitingForPrintDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                <ListComp title="Printing Date" value={row.printingDate ? new Date(parseInt(row.printingDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                <ListComp title="Completed Date" value={row.completedDate ? new Date(parseInt(row.completedDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                <ListComp title="Delivered Date" value={row.deliveredDate ? new Date(parseInt(row.deliveredDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                {row.assignmentStatus === "Rejected" && (
                  <>
                    <ListComp title="Rejected Date" value={row.rejectedDate ? new Date(parseInt(row.rejectedDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : "---"} />
                    <ListComp title="Rejection Reason" value={row.rejectionReason || "---"} />
                  </>
                )}
                {row.reassignedDate && (
                  <ListComp title="Reassigned Date" value={new Date(parseInt(row.reassignedDate)).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })} />
                )}
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Service</TableCell>
                          <TableCell>Job Description</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Total Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {row.services ? (
                          row.services.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {services.find((v) => v.id == row.service).name}
                              </TableCell>
                              <TableCell align="right">
                                {row.jobDescription}
                              </TableCell>
                              <TableCell align="right">
                                {row.material}
                              </TableCell>
                              <TableCell align="right">{row.size}</TableCell>
                              <TableCell align="right">
                                {row.quantity}
                              </TableCell>
                              <TableCell align="right">
                                {row.totalPrice}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>File name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>For</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {row.Files ? (
                          row.Files.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.fileName}
                              </TableCell>
                              <TableCell align="right">
                                {row.description}
                              </TableCell>
                              <TableCell align="right">{row.for}</TableCell>
                              <TableCell align="center">
                                <LoadingButton
                                  size="small"
                                  color="secondary"
                                  onClick={() =>
                                    handleDownload(
                                      row.id,
                                      row.extension,
                                      row.fileName
                                    )
                                  }
                                  loading={downloading == row.id}
                                  loadingPosition="start"
                                  startIcon={<SaveIcon />}
                                  variant="contained"
                                >
                                  <span>Save</span>
                                </LoadingButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
          )}
          <DialogActions>
            {(localStorage.getItem("user") == "SuperAdmin" ||
              localStorage.getItem("user") == "Reception") &&
              (row.progress == "Pending" ||
                row.progress == "WaitingForPrint") && (
                <FormControlLabel
                  control={
                    <Switch
                      color="secondary"
                      checked={openEditOrder}
                      onChange={(e) => setOpenEditOrder(e.target.checked)}
                    />
                  }
                  label="Edit order"
                />
              )}
            {(localStorage.getItem("user") == "SuperAdmin" ||
              localStorage.getItem("user") == "Manager" ||
              localStorage.getItem("user") == "Reception") &&
              row.assignmentStatus === "Rejected" && (
                <Button onClick={handleReassignOpen} color="warning" variant="contained" sx={{ mr: 2 }}>
                  Reassign
                </Button>
              )}
            <Button onClick={handleClose} color="secondary" variant="contained">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openReassign} onClose={() => setOpenReassign(false)} fullWidth maxWidth="sm">
          <DialogTitle>Reassign Order</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              This order was rejected. Please assign a specific Designer and/or Workshop.
            </DialogContentText>
            {row?.rejectionReason && (
              <Box mb={2} p={1} bgcolor="#ffebee" borderRadius={1}>
                <Typography color="error" variant="body2">
                  <strong>Reason for Rejection:</strong> {row.rejectionReason}
                </Typography>
              </Box>
            )}
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <FormControl fullWidth>
                <InputLabel>Designer</InputLabel>
                <Select
                  value={reassignDesigner}
                  label="Designer"
                  onChange={(e) => setReassignDesigner(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {designersData?.AllDesigners?.map((designer) => (
                    <MenuItem key={designer.id} value={designer.id}>
                      {designer.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Workshop</InputLabel>
                <Select
                  value={reassignWorkshop}
                  label="Workshop"
                  onChange={(e) => setReassignWorkshop(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {workshopsData?.AllWorkshops?.map((shop) => (
                    <MenuItem key={shop.id} value={shop.id}>
                      {shop.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReassign(false)} color="secondary">Cancel</Button>
            <Button onClick={handleReassignSubmit} color="primary" variant="contained">
              Reassign
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  );
};

export default Orders;

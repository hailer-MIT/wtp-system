import {
  Box,
  Button,
  useTheme,
  Grid,
  FormControl,
  Typography,
  TextField,
} from "@mui/material";
import { tokens } from "../../../theme";
//table
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

//dialog
import { useEffect, useState, Fragment } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { NewOrder } from "../../../graphql/subscription";
import ListComp from "../../../components/ListComp";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DesignerMyOrder } from "../../../graphql/query";
import { DesignerChangeOrderStatus, AcceptOrder, RejectOrder } from "../../../graphql/mutation";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Axios from "axios";
import FileDownload from "js-file-download";
import { useStoreState, useStoreActions } from "easy-peasy";
import { Formik } from "formik";
import { MuiFileInput } from "mui-file-input";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import RefreshIcon from "@mui/icons-material/Refresh";

function DesignerOrders() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [row, setRow] = useState({});
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [scroll, setScroll] = useState("paper");
  const [options, setOptions] = useState("Pending,Designing");
  const [downloading, setDownloading] = useState("");
  const [file, setFile] = useState(null);
  const [idIndex, setIdIndex] = useState(null);

  const services = useStoreState((state) => state.allServices.services);
  const { setAllOrderRefetch } = useStoreActions((actions) => ({
    setAllOrderRefetch: actions.allOrders.setRefetch,
  }));

  const { data, loading, error, refetch } = useQuery(DesignerMyOrder, {
    variables: { options: options.split(",") },
  });

  const [designerChangeOrderStatus, { Sdata, Sloading, Serror }] = useMutation(
    DesignerChangeOrderStatus
  );
  const [acceptOrder, { loading: acceptLoading }] = useMutation(AcceptOrder);
  const [rejectOrder, { loading: rejectLoading }] = useMutation(RejectOrder);

  // Subscribe to new orders to update list in real-time
  useSubscription(NewOrder, {
    onData: () => {
      // Refetch when new order arrives
      refetch({ options: options.split(",") });
    },
  });

  useEffect(() => {
    setAllOrderRefetch(refetch)
    refetch({ options: options.split(",") });
  }, [options]);

  const ChangeOrderStatus = async (progress, id) => {
    await designerChangeOrderStatus({
      variables: { orderId: id, progress: progress },
    });
    console.log(Sdata);
    refetch({ options: options.split(",") });
    setOpen(false);
  };

  const handleAcceptOrder = async () => {
    try {
      await acceptOrder({
        variables: { orderId: row.id },
      });
      refetch({ options: options.split(",") });
      setOpen(false);
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectOrder({
        variables: { orderId: row.id, reason: rejectionReason },
      });
      refetch({ options: options.split(",") });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setOpen(false);
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "customerName", headerName: "Customer Name" },
    {
      field: "contactPerson",
      headerName: "Contact Person",
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
      field: "services",
      headerName: "Services",
      flex: 1,
      valueFormatter: ({ value }) =>
        `${value.map((s) => services.find((v) => v.id == s.service).name)}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    // {
    //   field: "fullPayment",
    //   headerName: "Full Payment",
    //   flex: 1,
    // },
    {
      field: "deliveryDate",
      headerName: "Delivery Date",
      flex: 1,
      valueFormatter: ({ value }) =>
        `${new Date(value).toLocaleDateString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1,
      renderCell: ({ row: { progress, assignmentStatus } }) => {
        // Handle null progress (pending assignment)
        if (!progress && assignmentStatus === "Pending") {
          return (
            <Typography fontWeight="bold" fontSize={18} color="gray">

            </Typography>
          );
        }
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
  };
  const uploadHandleClose = () => {
    setUploadOpen(false);
  };
  const uploadHandleOpen = (orderId, index) => {
    console.log(orderId, index);
    setIdIndex({
      orderId: orderId,
      index: index,
    });
    setUploadOpen(true);
  };

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

  const handleFormSubmit = (values) => {
    values.file = file;
    const formData = new FormData();
    for (let value in values) {
      formData.append(value, values[value]);
    }

    Axios.post(
      `https://api.mekdesprinting.com/designFileUpload/${idIndex.orderId}/${idIndex.index}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem("token"),
        },
        onUploadProgress,
      }
    ).then((res) => {
      console.log(res.data);
      refetch({ options: options.split(",") });
      setOpen(false);
    });
    setUploadOpen(false);
  };
  const onUploadProgress = (progressEvent) => {
    const { loaded, total } = progressEvent;
    let percent = Math.floor((loaded * 100) / total);
    if (percent < 100) {
      console.log(`${loaded} bytes of ${total} bytes. ${percent}%`);
    }
  };

  return (
    <Box>
      <Box
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
              value={"Pending,Designing"}
              control={<Radio color="secondary" />}
              label="Pending and Designing"
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
              value={"Completed,Delivered,WaitingForPrint,Printing"}
              control={<Radio color="secondary" />}
              label="Completed"
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
          autoPageSize
          loading={loading}
          pagination
          rows={data ? data.DesignerMyOrder : []}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            sorting: {
              sortModel: [{ field: "id", sort: "desc" }],
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
          maxWidth="md"
        >
          <DialogTitle
            id="scroll-dialog-title"
            fontSize={20}
            display="flex"
            gap={3}
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h3">Order Details</Typography>
            {buttonSelector()}
          </DialogTitle>
          <DialogContent dividers={scroll === "paper"}>
            <Grid container spacing={2}>
              <ListComp title="Customer Name" value={row.customerName} />
              <ListComp title="Contact Person" value={row.contactPerson} />
              <ListComp title="Phone Number" value={`0${row.phoneNumber}`} />
              <ListComp title="Email" value={row.email} />
              <ListComp title="Received By" value={row.receivedBy} />
              <ListComp title="WorkShop" value={row.workShop} />
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
                value={new Date(row.deliveryDate).toLocaleDateString("en-us", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
              <ListComp title="Progress" value={row.progress} />
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
                  <Table aria-label="collapsible table">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Service</TableCell>
                        <TableCell align="right">Job Description</TableCell>
                        <TableCell align="right">Material</TableCell>
                        <TableCell align="right">Size</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        {row.progress == "Designing" && (
                          <TableCell align="right">Action</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row.services &&
                        row.services.map((Srow, index) => (
                          <Row
                            key={index}
                            orderId={row.id}
                            index={index}
                            row={Srow}
                            uploadHandleOpen={uploadHandleOpen}
                            progress={row.progress}
                          />
                        ))}
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
                              "&:last-child td, &:last-child th": { border: 0 },
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
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="contained">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullWidth={true}
          maxWidth="sm"
          open={uploadOpen}
          onClose={uploadHandleClose}
        >
          <DialogTitle>Upload Designed File</DialogTitle>
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
                    <DialogActions>
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={uploadHandleClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="Submit"
                        color="secondary"
                        variant="contained"
                      >
                        Add file
                      </Button>
                    </DialogActions>
                  </Box>
                </form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
        <Dialog
          open={rejectDialogOpen}
          onClose={() => {
            setRejectDialogOpen(false);
            setRejectionReason("");
          }}
          aria-labelledby="reject-dialog-title"
          aria-describedby="reject-dialog-description"
        >
          <DialogTitle id="reject-dialog-title">Reject Order</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please provide a reason for rejecting this order:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="rejection-reason"
              label="Rejection Reason"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleRejectOrder}
              color="error"
              variant="contained"
              loading={rejectLoading}
            >
              Reject
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  );

  function buttonSelector() {
    // Show Accept/Reject buttons if assignment status is Pending and progress is null
    if (row.assignmentStatus === "Pending" && (!row.progress || row.progress === null)) {
      return (
        <Box display="flex" gap={2}>
          <Button
            onClick={handleAcceptOrder}
            color="success"
            variant="contained"
            disabled={acceptLoading}
          >
            Accept Order
          </Button>
          <Button
            onClick={() => setRejectDialogOpen(true)}
            color="error"
            variant="contained"
          >
            Reject Order
          </Button>
        </Box>
      );
    }

    // Show rejection reason if rejected
    if (row.assignmentStatus === "Rejected") {
      return (
        <Typography color="error" variant="body2">
          Rejected: {row.rejectionReason || "No reason provided"}
        </Typography>
      );
    }

    // Show accepted status
    if (row.assignmentStatus === "Accepted") {
      switch (row.progress) {
        case "Pending":
          return (
            <Button
              onClick={() => {
                console.log(row.id);
                ChangeOrderStatus("Designing", row.id);
              }}
              color="secondary"
              variant="contained"
            >
              Start Designing
            </Button>
          );
        case "Designing":
          return (
            <Button
              bg="red"
              onClick={() => {
                console.log(row.id);
                ChangeOrderStatus("Completed", row.id);
              }}
              color="secondary"
              variant="contained"
            >
              Complete order
            </Button>
          );
      }
    }

    // Fallback for orders without assignment status (backward compatibility)
    switch (row.progress) {
      case "Pending":
        return (
          <Button
            onClick={() => {
              console.log(row.id);
              ChangeOrderStatus("Designing", row.id);
            }}
            color="secondary"
            variant="contained"
          >
            Start Designing
          </Button>
        );
      case "Designing":
        return (
          <Button
            bg="red"
            onClick={() => {
              console.log(row.id);
              ChangeOrderStatus("Completed", row.id);
            }}
            color="secondary"
            variant="contained"
          >
            Complete order
          </Button>
        );
    }
  }
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = useState(false);
  const services = useStoreState((state) => state.allServices.services);

  return (
    <Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          {row.completedFiles.length > 0 && (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          {services.find((v) => v.id == row.service).name}
        </TableCell>
        <TableCell align="right">{row.jobDescription}</TableCell>
        <TableCell align="right">{row.material}</TableCell>
        <TableCell align="right">{row.size}</TableCell>
        <TableCell align="right">{row.quantity}</TableCell>
        {props.progress == "Designing" && (
          <TableCell align="right">
            <LoadingButton
              size="small"
              color="secondary"
              onClick={() => props.uploadHandleOpen(props.orderId, props.index)}
              // loading={downloading == row.id}
              loadingPosition="start"
              // startIcon={<SaveIcon />}
              variant="contained"
            >
              <span>upload</span>
            </LoadingButton>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Design files
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.completedFiles != null &&
                    row.completedFiles.map((fileMeta) => (
                      <TableRow key={fileMeta.date}>
                        <TableCell component="th" scope="row">
                          {fileMeta.fileName}
                        </TableCell>
                        <TableCell>{fileMeta.description}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default DesignerOrders;

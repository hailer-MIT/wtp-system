import {
  Box,
  Button,
  useTheme,
  Grid,
  FormControl,
  Typography,
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
import { useQuery, useMutation } from "@apollo/client";
import ListComp from "../../../components/ListComp";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { WorkShopeMyOrder } from "../../../graphql/query";
import { WorkShopeChangeOrderStatus } from "../../../graphql/mutation";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Axios from "axios";
import FileDownload from "js-file-download";
import { useStoreState } from "easy-peasy";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import DownloadIcon from '@mui/icons-material/Download';

function WorkShopeOrders() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [row, setRow] = useState({});
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState("paper");
  const [options, setOptions] = useState("WaitingForPrint,Printing");
  const [downloading, setDownloading] = useState("");

  const { data, loading, error, refetch } = useQuery(WorkShopeMyOrder, {
    variables: { options: options.split(",") },
  });

  const services = useStoreState((state) => state.allServices.services);

  const [workShopeChangeOrderStatus, { Sdata, Sloading, Serror }] = useMutation(
    WorkShopeChangeOrderStatus
  );

  useEffect(() => {}, [data, error]);
  useEffect(() => {
    refetch({ options: options.split(",") });
  }, [options]);

  const ChangeOrderStatus = async (progress, id) => {
    await workShopeChangeOrderStatus({
      variables: { orderId: id, progress: progress },
    });
    console.log(Sdata);
    refetch({ options: options.split(",") });
    setOpen(false);
  };

  const handleDownload = (id, extension, name) => {
    setDownloading(id);
    Axios.get(`http://localhost:4000/fileDownload/${id}.${extension}`, {
      responseType: "blob",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((res) => {
        FileDownload(res.data, name);
        setDownloading("");
      })
      .catch(function (error) {
        setDownloading("");
      });
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
      field: "tinNumber",
      headerName: "Tin Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "fullPayment",
      headerName: "Full Payment",
      flex: 1,
    },
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
      renderCell: ({ row: { progress } }) => {
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
              <Typography fontWeight="bold" fontSize={18} color="yellow">
                {progress}
              </Typography>
            );
          case "Completed":
            return (
              <Typography fontWeight="bold" fontSize={18} color="green">
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
              value={"WaitingForPrint,Printing"}
              control={<Radio color="secondary" />}
              label="Waiting For Print / Printing"
            />
            <FormControlLabel
              value={"WaitingForPrint"}
              control={<Radio color="secondary" />}
              label="Waiting For Print"
            />
            <FormControlLabel
              value={"Printing"}
              control={<Radio color="secondary" />}
              label="Printing"
            />
            <FormControlLabel
              value={"Completed,Delivered"}
              control={<Radio color="secondary" />}
              label="Completed / Delivered"
            />
          </RadioGroup>
        </FormControl>
        <DataGrid
          autoPageSize
          loading={loading}
          pagination
          rows={data ? data.WorkShopeMyOrder : []}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
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
          maxWidth="xl"
        >
          <DialogTitle
            id="scroll-dialog-title"
            fontSize={20}
            display="flex"
            gap={3}
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
              <ListComp title="WorkShope" value={row.workShope} />
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
              <Grid item xs={6}>
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
                            downloading={downloading}
                            handleDownload={handleDownload}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={6}>
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
      </div>
    </Box>
  );

  function buttonSelector() {
    // eslint-disable-next-line default-case
    switch (row.progress) {
      case "WaitingForPrint":
        return (
          <Button
            onClick={() => {
              console.log(row.id);
              ChangeOrderStatus("Printing", row.id);
            }}
            color="secondary"
            variant="contained"
          >
            Start printing
          </Button>
        );
      case "Printing":
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
                    <TableCell>Action</TableCell>
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
                        <TableCell>
                          <LoadingButton
                            size="small"
                            color="secondary"
                            onClick={() =>
                              props.handleDownload(
                                fileMeta.id,
                                fileMeta.extension,
                                fileMeta.fileName
                              )
                            }
                            loading={props.downloading == row.id}
                            loadingPosition="start"
                            startIcon={<SaveIcon />}
                            variant="contained"
                          >
                            <span>Save</span>
                          </LoadingButton>
                        </TableCell>
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

export default WorkShopeOrders;

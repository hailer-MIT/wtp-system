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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useQuery } from "@apollo/client";
import { AllOrders } from "../../graphql/query";
import { styled } from "@mui/material/styles";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [row, setrow] = useState({});
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState("paper");
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [], //mockDataContacts,
    total: 0,
    page: 0,
    limit: 6,
  });

  const { data, loading, error, refetch } = useQuery(AllOrders, {
    variables: { page: pageState.page, limit: pageState.limit },
  });

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
      field: "advancePayment",
      headerName: "Advance Payment",
      flex: 1,
    },
    {
      field: "remainingPayment",
      headerName: "Remaining Payment",
      flex: 1,
    },
  ];

  const handleRowClick = (params) => {
    console.log(params.row);
    setrow(params.row);
    setOpen(true);
    setScroll(scroll);
  };

  const handleClose = () => {
    setOpen(false);
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
    if (data) {
      refetch({
        page: pageState.page,
        limit: pageState.limit,
      });
    }
    console.log(pageState.page, pageState.limit);
  }, [pageState.page, pageState.limit]);
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

  return (
    <Box m="20px">
      <Header
        title="CONTACTS"
        subtitle="List of Contacts for Future Reference"
      />
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          autoPageSize
          rows={pageState.data}
          rowCount={pageState.total}
          loading={pageState.isLoading}
          // rowsPerPageOptions={[1,2,10]}
          pagination
          page={pageState.page}
          pageSize={pageState.limit}
          paginationMode="server"
          filterMode="server"
          onFilterModelChange={(details) => console.log(details.items[0])}
          onPageChange={(newPage) => {
            console.log("newpage", newPage);
            setPageState((old) => ({ ...old, page: newPage }));
          }}
          onPageSizeChange={(newPageSize) => {
            console.log("newPage", newPageSize);
            setPageState((old) => ({ ...old, limit: newPageSize }));
          }}
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
          maxWidth="md"
        >
          <DialogTitle id="scroll-dialog-title" fontSize={20} textAlign="center">Order Details</DialogTitle>
          <DialogContent dividers={scroll === "paper"}>
            <Grid container spacing={2}>
              <ListComp title="Customer Name" value={row.customerName} />
              <ListComp title="Contact Person" value={row.contactPerson} />
              <ListComp title="Phone Number" value={`0${row.phoneNumber}`} />
              <ListComp title="Tin Number" value={row.tinNumber} />
              <ListComp title="Email" value={row.email} />
              <ListComp title="Full Payment" value={row.fullPayment} />
              <ListComp title="Advance Payment" value={row.advancePayment} />
              <ListComp title="Remaining Payment" value={row.remainingPayment} />
              <ListComp title="Received By" value={row.receivedBy} />
              <ListComp title="Designed By" value={row.designedBy} />
              <ListComp title="WorkShope" value={row.workShope} />
              <ListComp title="Ordered Date" value={Date(row.orderedDate)} />
              <ListComp title="Delivery Date" value={Date(row.deliveryDate)} />
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
              <ListComp title="Satisfaction Rate" value={row.satisfactionRate} />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="contained">Cancel</Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  );
};

function ListComp(props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const value = props.value
  if (value) return (
    <Grid item xs={12}>
      <Box display="flex" gap={1}>
        <Typography color={colors.greenAccent[600]} variant="h3" gutterBottom>
          {props.title}:
        </Typography>
        <Typography variant="h3"> {props.value}</Typography>
      </Box>
    </Grid>
  );
  else return (<></>)
}

export default Contacts;

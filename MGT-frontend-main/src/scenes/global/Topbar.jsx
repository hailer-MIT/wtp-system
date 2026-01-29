import {
  Box,
  IconButton,
  useTheme,
  Hidden,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Badge,
} from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useStoreActions } from "easy-peasy";
import MenuIcon from "@mui/icons-material/Menu";
import { SidebarCtx } from "../../context";
import { useQuery, useSubscription } from "@apollo/client";
import { DesignerMyOrder, WorkShopMyOrder, AllOrders } from "../../graphql/query";
import { NewOrder } from "../../graphql/subscription";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const userRole = localStorage.getItem("user");
  const navigate = useNavigate();

  const { setToggled } = useStoreActions((actions) => ({
    setToggled: actions.sidebar.setToggled,
  }));

  const { setLoggedIn } = useContext(SidebarCtx);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingOrdersList, setPendingOrdersList] = useState([]);

  // Query for pending orders based on user role
  const designerQuery = useQuery(DesignerMyOrder, {
    variables: { options: ["Pending"] },
    skip: userRole !== "Designer",
    fetchPolicy: "cache-and-network",
    pollInterval: 30000, // Poll every 30 seconds as backup
  });

  const workshopQuery = useQuery(WorkShopMyOrder, {
    variables: { options: ["WaitingForPrint"] },
    skip: userRole !== "WorkShop",
    fetchPolicy: "cache-and-network",
    pollInterval: 30000, // Poll every 30 seconds as backup
  });

  const rejectedQuery = useQuery(AllOrders, {
    variables: { page: 0, limit: 100, options: ["Rejected"] }, // Fetch up to 100 rejected orders
    skip: userRole === "Designer" || userRole === "WorkShop",
    fetchPolicy: "cache-and-network",
    pollInterval: 30000,
  });

  // Update pending count when data changes
  useEffect(() => {
    if (userRole === "Designer" && designerQuery.data?.DesignerMyOrder) {
      const pendingOrders = designerQuery.data.DesignerMyOrder.filter(
        (order) => order.assignmentStatus === "Pending" || !order.assignmentStatus
      );
      setPendingCount(pendingOrders.length);
      setPendingOrdersList(pendingOrders);
    } else if (userRole === "WorkShop" && workshopQuery.data?.WorkShopMyOrder) {
      // Workshop sees orders that are "WaitingForPrint" AND (Pending assignment or Accepted)
      // The query already filters for "WaitingForPrint".
      // Refined Logic (User Request): 
      // Count ONLY those that have NOT been accepted yet (assignmentStatus === "Pending").
      // Once accepted, they drop off the count, even if status is still "WaitingForPrint".
      const pendingOrders = workshopQuery.data.WorkShopMyOrder.filter(
        (order) => order.assignmentStatus === "Pending" || !order.assignmentStatus
      );
      setPendingCount(pendingOrders.length);
      setPendingOrdersList(pendingOrders);
    } else if (userRole !== "Designer" && userRole !== "WorkShop" && rejectedQuery.data?.AllOrders) {
      // For other roles (Reception, Admin, etc.), show Rejected Orders
      const rejectedOrders = rejectedQuery.data.AllOrders.data;
      setPendingCount(rejectedOrders.length);
      setPendingOrdersList(rejectedOrders);
    } else {
      setPendingCount(0);
      setPendingOrdersList([]);
    }
  }, [designerQuery.data, workshopQuery.data, rejectedQuery.data, userRole]);

  // Subscribe to new orders to update count in real-time
  useSubscription(NewOrder, {
    skip: userRole !== "Designer" && userRole !== "WorkShop",
    onData: ({ data }) => {
      // Refetch queries to update the count immediately when new order arrives
      // This handles both new orders and orders transitioning from Designer to Workshop
      if (userRole === "Designer" && designerQuery.refetch) {
        designerQuery.refetch();
      } else if (userRole === "WorkShop" && workshopQuery.refetch) {
        // When Designer completes, order moves to Workshop - refetch to update count
        workshopQuery.refetch();
      }
    },
  });

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box display="flex" gap={3} alignItems={"center"}>
        <Hidden mdUp>
          <IconButton onClick={() => setToggled(true)}>
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Box
          display="flex"
          backgroundColor={colors.primary[400]}
          borderRadius="3px"
        >
          <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton onClick={handleNotificationClick}>
          <Badge
            badgeContent={pendingCount}
            color="error"
            invisible={pendingCount === 0}
          >
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchorEl}
          open={notificationOpen}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box px={2} py={1}>
            <Typography variant="subtitle2">New Assignments</Typography>
          </Box>
          {pendingOrdersList.length > 0 ? (
            pendingOrdersList.map((order, index) => (
              <MenuItem key={index} onClick={() => {
                handleNotificationClose();
                // Navigate to orders page if it's a rejected order notification (for Reception/Admin)
                if (userRole !== "Designer" && userRole !== "WorkShop") {
                  // We might want to filter the orders table to show this order, but for now just go to orders page
                  // Or passing a state to filter?
                  navigate("/orders");
                }
              }}>
                <Box display="flex" flexDirection="column">
                  <Typography variant="body2" fontWeight="bold">
                    {order.customerName || "Customer"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.assignmentStatus === "Rejected" ? "Rejected" : new Date(order.orderedDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>
        <IconButton
          onClick={handleProfileMenuOpen}
          size="large"
          edge="end"
          color="inherit"
        >
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: colors.blueAccent[500] }}
          >
            {String(localStorage.getItem("name") || "")
              .charAt(0)
              .toUpperCase() || <PersonOutlinedIcon fontSize="small" />}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box px={2} py={1}>
            <Typography variant="subtitle2">
              {localStorage.getItem("name") || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {localStorage.getItem("user") || ""}
            </Typography>
          </Box>
          <MenuItem
            onClick={() => {
              colorMode.toggleColorMode();
              handleMenuClose();
            }}
          >
            Toggle theme
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleMenuClose();
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;

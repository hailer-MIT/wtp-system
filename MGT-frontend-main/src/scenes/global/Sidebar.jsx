import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Hidden } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useEffect } from "react";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DescriptionIcon from "@mui/icons-material/Description";
import { NewOrder } from "../../graphql/subscription";
import addNotification from "react-push-notification";
import { useSubscription } from "@apollo/client";
import Logo from "../../images/logo.png";
import { useStoreState, useStoreActions } from "easy-peasy";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { setToggled } = useStoreActions((actions) => ({
    setToggled: actions.sidebar.setToggled,
  }));
  useEffect(() => {
    if (selected == "Logout") localStorage.setItem("token", "");
    console.log(selected);
  }, [selected]);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: selected === title ? "#fff" : colors.grey[100],
        margin: "5px 0",
      }}
      onClick={() => {
        setSelected(title);
        setToggled(false);
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  // const [toggled, setToggled] = useState(false);
  const user = localStorage.getItem("user");

  const { refetch, toggled } = useStoreState((state) => ({
    refetch: state.allOrders.refetch,
    toggled: state.sidebar.toggled,
  }));

  const { setToggled } = useStoreActions((actions) => ({
    setToggled: actions.sidebar.setToggled,
  }));

  useSubscription(NewOrder, {
    onData: () => {
      addNotification({
        title: "New Order",
        message:
          localStorage.getItem("user") == "Designer" ||
            localStorage.getItem("user") == "WorkShop"
            ? "New order assigned to you"
            : "New order added",
        duration: 5000,
        icon: Logo,
        onClick: (e) => {
          switch (localStorage.getItem("user")) {
            case "Reseption":
            case "SuperAdmin":
            case "Manager":
              navigate("/orders");
              break;
            default:
              navigate("/dashboard");
              break;
          }
        },
        native: true,
      });
      refetch();
    },
  });

  return (
    <Box
      height="100vh"
      position="sticky"
      top={0}
      sx={{
        "& .pro-sidebar-inner": {
          background: `linear-gradient(180deg, ${colors.primary[400]} 0%, ${colors.primary[900]} 100%) !important`,
          boxShadow: "4px 0px 20px rgba(0, 0, 0, 0.2)",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
          margin: "0 10px",
          borderRadius: "10px",
          transition: "all 0.3s ease",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
          transform: "translateX(5px)",
          backgroundColor: `${colors.primary[300]} !important`,
        },
        "& .pro-menu-item.active .pro-inner-item": {
          color: "#ffffff !important",
          backgroundColor: `${colors.blueAccent[500]} !important`,
        },
      }}
    >
      <ProSidebar
        collapsed={isCollapsed}
        breakPoint="lg"
        onToggle={() => setToggled(false)}
        toggled={toggled}
      >
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  wonderfull trading plc
                </Typography>
                <Hidden mdDown>
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon />
                  </IconButton>
                </Hidden>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box
                  sx={{
                    background: `linear-gradient(45deg, ${colors.blueAccent[400]}, ${colors.greenAccent[400]})`,
                    padding: "3px",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    alt="profile-user"
                    width="100px"
                    height="100px"
                    src={
                      localStorage.getItem("photo")
                        ? localStorage.getItem("photo").startsWith("http") ||
                          localStorage.getItem("photo").startsWith("/")
                          ? `https://api.mekdesprinting.com${localStorage.getItem("photo")}`
                          : localStorage.getItem("photo")
                        : `../../assets/user.png`
                    }
                    style={{
                      cursor: "pointer",
                      borderRadius: "50%",
                      border: `4px solid ${colors.primary[400]}`,
                    }}
                  />
                </Box>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0", letterSpacing: "1px" }}
                >
                  {localStorage.getItem("name")}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {localStorage.getItem("user")}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {user == "Reception" ||
              user == "SuperAdmin" ||
              user == "Manager" ? (
              <>
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{ m: "25px 0 5px 20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" }}
                >
                  Order
                </Typography>
                <Item
                  title="All Orders"
                  to="/orders"
                  icon={<ReceiptIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            ) : (
              <></>
            )}

            {localStorage.getItem("user") == "SuperAdmin" ||
              localStorage.getItem("user") == "Reception" ? (
              <>
                {localStorage.getItem("user") == "SuperAdmin" && (
                  <>
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: "25px 0 5px 20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" }}
                    >
                      Users
                    </Typography>
                    <Item
                      title="Users"
                      to="/users"
                      icon={<PersonOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </>
                )}
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{ m: "25px 0 5px 20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" }}
                >
                  Services
                </Typography>
                <Item
                  title="Service"
                  to="/Service"
                  icon={<TimelineOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            ) : (
              <></>
            )}
            {localStorage.getItem("user") != "Cashier" && (
              <>
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{ m: "25px 0 5px 20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" }}
                >
                  Inventory
                </Typography>
                <Item
                  title="Current"
                  to="/current"
                  icon={<InventoryIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                {(localStorage.getItem("user") == "InventoryClerk" ||
                  localStorage.getItem("user") == "SuperAdmin" ||
                  localStorage.getItem("user") == "Manager" ||
                  localStorage.getItem("user") == "Accountant") && (
                    <>
                      <Item
                        title="fixed"
                        to="/fixed"
                        icon={<DescriptionIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                      <Item
                        title="accessory"
                        to="/accessory"
                        icon={<AssessmentIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    </>
                  )}
              </>
            )}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "25px 0 5px 20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" }}
            >
              Logout
            </Typography>
            <Item
              title="Logout"
              to="/"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;

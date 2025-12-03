import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  CssBaseline,
  Tooltip,
  Paper,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  InputAdornment,
  Select,          // <-- Added
  MenuItem,        // <-- Added
  FormControl,     // <-- Added
  InputLabel       // <-- Added
} from "@mui/material";
import {
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import MiniSidebar from "./MiniSidebar";
import Logo from "../assets/analytics_hub_logo_with_text1.png";

export default function SettingsPage() {
  const { user, logout, mode, toggleTheme, currency, setCurrency } = useAuth(); // <-- Get currency props
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); 
    navigate("/login");
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img src={Logo} alt="Analytics Hub" style={{ width: 250, height: 50, objectFit: "contain", marginLeft: -30  }} />
          </Box>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", px: { xs: 1, sm: 6 }, marginLeft: 60, marginRight: -5 }}>
            <TextField
              placeholder="Search dashboards, questions, users..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", sm: 350 }, bgcolor: "background.paper", borderRadius: 2 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
          </Box>

          <Tooltip title={`Role: ${user?.role || "N/A"}`} arrow>
            <Button
              color="inherit"
              startIcon={<PersonIcon />}
              sx={{ textTransform: "none", fontWeight: 600, marginRight: 1, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" }}}
            >
              {user?.username || "Guest"}
            </Button>
          </Tooltip>

          <Button
            color="inherit"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "white", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" }}}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", mt: "64px", height: "calc(100vh - 64px)" }}>
        <MiniSidebar currentPath={location.pathname} />
        <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: "background.default", height: "100%", overflow: "auto" }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "text.primary" }}>Settings</Typography>
          
          <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Display Preferences</Typography>
            
            {/* Theme Toggle */}
            <FormControlLabel
              control={<Switch checked={mode === "dark"} onChange={toggleTheme} color="primary" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {mode === 'dark' ? <Brightness4Icon sx={{ mr: 1 }} /> : <Brightness7Icon sx={{ mr: 1 }} />}
                  {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Box>
              }
            />

            {/* Currency Selector */}
            <Box sx={{ mt: 3, maxWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="currency-select-label">Preferred Currency</InputLabel>
                <Select
                  labelId="currency-select-label"
                  value={currency}
                  label="Preferred Currency"
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="₹">INR (₹)</MenuItem>
                  <MenuItem value="$">USD ($)</MenuItem>
                  <MenuItem value="€">EUR (€)</MenuItem>
                  <MenuItem value="£">GBP (£)</MenuItem>
                </Select>
              </FormControl>
            </Box>

          </Paper>
        </Box>
      </Box>
    </>
  );
}
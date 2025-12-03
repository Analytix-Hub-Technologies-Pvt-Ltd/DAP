import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = window.env.API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // --- Theme Mode State ---
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  // --- Currency State ---
  const [currency, setCurrencyState] = useState(() => {
    const savedCurrency = localStorage.getItem("appCurrency");
    return savedCurrency || "₹"; // Default to ₹
  });

  // Persist to LocalStorage whenever they change (for guest/offline consistency)
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("appCurrency", currency);
  }, [currency]);

  // --- Global State Cache ---
  const [globalState, setGlobalState] = useState({});

  const updateGlobalState = useCallback((key, value) => {
    setGlobalState(prev => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  // --- Pinned Data State ---
  const [pinnedItems, setPinnedItemsState] = useState([]);
  const [pinnedDashboards, setPinnedDashboardsState] = useState([]);

  // --- HELPER: Save ALL Preferences to DB ---
  const savePreferencesToBackend = async (newItems, newDashboards, newMode, newCurrency) => {
    if (!user) return;
    try {
      await axios.post(`${API_URL}/api/user/preferences`, {
        pinned_items: newItems,
        pinned_dashboards: newDashboards,
        theme_mode: newMode,
        currency: newCurrency
      }, { withCredentials: true });
    } catch (error) {
      console.error("Failed to save preferences to DB", error);
    }
  };

  // 1. LOAD PREFERENCES FROM DB ON LOGIN
  useEffect(() => {
    async function fetchPreferences() {
      if (user && user.username) {
        try {
          const response = await axios.get(`${API_URL}/api/user/preferences`, {
            withCredentials: true 
          });
          
          if (response.data.success) {
            const prefs = response.data.preferences || {};
            
            // Load Pinned Items
            setPinnedItemsState(prefs.pinned_items || []);
            setPinnedDashboardsState(prefs.pinned_dashboards || []);

            // Load Theme
            if (prefs.theme_mode) {
              setMode(prefs.theme_mode);
            }

            // Load Currency
            if (prefs.currency) {
              setCurrencyState(prefs.currency);
            }
          }
        } catch (error) {
          console.error("Failed to load preferences from DB", error);
        }
      } else {
        // Clear sensitive state on logout, but keep theme/currency in localStorage (handled by state init)
        setPinnedItemsState([]);
        setPinnedDashboardsState([]);
      }
    }
    fetchPreferences();
  }, [user]);

  // 2. CUSTOM SETTERS (Update State + Save to DB)
  
  const setPinnedItems = useCallback((newItemsOrFunc) => {
    setPinnedItemsState((prev) => {
      const newItems = typeof newItemsOrFunc === 'function' ? newItemsOrFunc(prev) : newItemsOrFunc;
      savePreferencesToBackend(newItems, pinnedDashboards, mode, currency);
      return newItems;
    });
  }, [user, pinnedDashboards, mode, currency]);

  const setPinnedDashboards = useCallback((newDashboardsOrFunc) => {
    setPinnedDashboardsState((prev) => {
      const newDashboards = typeof newDashboardsOrFunc === 'function' ? newDashboardsOrFunc(prev) : newDashboardsOrFunc;
      savePreferencesToBackend(pinnedItems, newDashboards, mode, currency);
      return newDashboards;
    });
  }, [user, pinnedItems, mode, currency]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      savePreferencesToBackend(pinnedItems, pinnedDashboards, newMode, currency);
      return newMode;
    });
  }, [user, pinnedItems, pinnedDashboards, currency]);

  const setCurrency = useCallback((newCurrency) => {
    setCurrencyState(newCurrency);
    savePreferencesToBackend(pinnedItems, pinnedDashboards, mode, newCurrency);
  }, [user, pinnedItems, pinnedDashboards, mode]);

  const login = useCallback((userData) => setUser(userData), []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username }),
        credentials: 'include'
      });
    } catch (err) {
      console.error("Error logging out on backend:", err);
    }
    setUser(null);
    setGlobalState({});
    setPinnedItemsState([]);
    setPinnedDashboardsState([]);
  }, [user]);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    pinnedItems,
    setPinnedItems,
    pinnedDashboards,
    setPinnedDashboards,
    mode,
    toggleTheme,
    currency,        // <-- Exported
    setCurrency,     // <-- Exported
    globalState,
    updateGlobalState
  }), [
    user,
    login,
    logout,
    pinnedItems,
    setPinnedItems,
    pinnedDashboards,
    setPinnedDashboards,
    mode,
    toggleTheme,
    currency,
    setCurrency,
    globalState,
    updateGlobalState
  ]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
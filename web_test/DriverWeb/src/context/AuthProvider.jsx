import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const TTL = 1000 * 60 * 60 * 24; // 24 hours
const KEY_REGISTERED = "mock_registered_users"
const KEY_SESSION = "active_session"


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSessionWithTTL = (userData) => {
    const now = new Date()
    const item = {
      value: userData,
      expiry: now.getTime() + TTL,
    }
    localStorage.setItem(KEY_SESSION, JSON.stringify(item))
  }

  const getSessionWithTTL = () => {
    const itemStr = localStorage.getItem(KEY_SESSION)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)
      const now = new Date()

      if (now.getTime() > item.expiry) {
        console.warn("TTL Expired. Clearing session.")
        localStorage.clear()
        return null
      }
      return item.value
    } catch (error) {
      return null
    }
  }

  useEffect(() => {
    const storedUser = getSessionWithTTL();
    if (storedUser) setUser(storedUser);

    setLoading(false);
  }, []);

  const register = async (userData) => {
    console.log('start', userData)
    const result = await authService.register(userData);
    console.log('end', result)

    if (result == null) return result;

    if (result.success) {
      // FIX: Ensure token is included in storage, just like login
      const userToStore = { ...result.user, token: result.token || result.user?.token };
      setUser(userToStore);
      setSessionWithTTL(userToStore);
    } else if (result.error === "User already exists") {
      // If registration fails because user already exists, try to log them in
      return login(userData.username, userData.password);
    }
    return result;
  };

  const login = async (username, password) => {
    try {
      const result = await authService.login(username, password);

      if (result && result.success) {
        // Ensure token is stored if returned separately
        const userToStore = { ...result.user, token: result.token || result.user?.token };
        setUser(userToStore);
        setSessionWithTTL(userToStore);
        return { success: true, user: userToStore };
      }

      return { success: false, error: result?.error || "Invalid username or password" };
    } catch (error) {
      return { success: false, error: "Invalid email or password" };
    }
  };

  // 4. LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  // 5. UPDATE USER FUNCTION
  const updateUser = async (updates) => {
    if (!user || (!user.uid && !user.id)) return { success: false, error: "Not authenticated" };
    const id = user.uid || user.id;

    try {
      // Import dynamically or assume it's available?
      // Better to import at top, but for now let's assume `driverService` is needed.
      // Wait, AuthProvider uses authService. I should import driverService.
      // Or move this logic to Profile? But Profile expects updateUser from context.

      // Let's rely on authService or driverService.
      // Since this is AuthProvider, maybe it should be generic?
      // But we know it's DriverWeb.

      const { driverService } = await import("../services/driverService");
      const result = await driverService.updateDriver(id, updates);

      if (result) {
        // Merge updates into local user state
        // API might return the updated user, or just success.
        // Assuming result is the updated data or we merge updates manually.
        // Let's assume result contains the updated fields or success.

        // If result is the updated object (usually is from apiClient)
        // Check structure.

        const updatedUser = { ...user, ...updates, ...result };
        setUser(updatedUser);
        setSessionWithTTL(updatedUser);
        return { success: true, user: updatedUser };
      }
      return { success: false, error: "Update failed" };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message || "Update failed" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
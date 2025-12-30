import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const TTL = 1000 * 60 * 60
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
      // FIX: Ensure token is included in storage
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
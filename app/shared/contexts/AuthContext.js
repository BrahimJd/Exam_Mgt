import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { initDatabase, executeSql } from "../utils/database";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await checkAuthState();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const checkAuthState = async () => {
    try {
      const result = await executeSql("SELECT * FROM users LIMIT 1");
      if (result.rows._array.length > 0) setUser(result.rows._array[0]);
    } catch (error) {
      console.error("Auth state check failed:", error);
    }
  };

  const login = async (username, password) => {
    try {
      if (!username || !password)
        throw new Error("Username and password required");

      const result = await executeSql(
        `SELECT * FROM users WHERE username = ? AND password = ?`,
        [username.trim(), password.trim()]
      );

      if (!result.rows._array.length)
        throw new Error("Invalid username or password");

      const userData = result.rows._array[0];
      if (
        !userData.role ||
        !["student", "instructor"].includes(userData.role)
      ) {
        throw new Error("Invalid user role");
      }

      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const existingUser = await executeSql(
        "SELECT * FROM users WHERE username = ?",
        [userData.username]
      );

      if (existingUser.rows.length > 0)
        throw new Error("Username already exists");

      const result = await executeSql(
        "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
        [userData.username, userData.password, userData.name, userData.role]
      );

      const newUser = {
        id: result.insertId,
        ...userData,
      };

      setUser(newUser);
      return newUser;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (user?.id) {
        await executeSql("DELETE FROM quiz_progress WHERE userId = ?", [
          user.id,
        ]);
      }
      setUser(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
      return false;
    }
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

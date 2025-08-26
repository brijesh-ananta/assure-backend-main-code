import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // Or your preferred axios instance
import apiService from "../services";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("bhtoken") || null);
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedToken = localStorage.getItem("bhtoken");
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile from API using the token
      axios
        .get(import.meta.env.VITE_TOKEN_BASE_URL + "/users/profile-v2", {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((res) => {
          if (res.data && res.data.success) {
            setUser(res.data.user);
          }
        });
    }
  }, []);

  const login = (newToken, profile) => {
    localStorage.setItem("bhtoken", newToken);
    setToken(newToken);
    setUser(profile);
  };

  const logout = async (refresh = false) => {
    try {
      await apiService.user.logoutUser();
    } catch (error) {
      console.lor(error);
    } finally {
      localStorage.removeItem("bhtoken");
      localStorage.removeItem("ciperText");

      setToken(null);
      setUser(null);

      if (refresh) {
        window.location.reload();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        userRole: user.role,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

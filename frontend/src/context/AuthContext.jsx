import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("truthlens_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signup = async (formData) => {
    const res = await api.post("/auth/signup", formData);
    localStorage.setItem("truthlens_token", res.data.token);
    localStorage.setItem("truthlens_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);
    localStorage.setItem("truthlens_token", res.data.token);
    localStorage.setItem("truthlens_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("truthlens_token");
    localStorage.removeItem("truthlens_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
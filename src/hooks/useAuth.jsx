 import { useState, useEffect, createContext, useContext } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUserInfo()
      .then((res) => {
        if (res.success) {
          setUser(res.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });

    if (res.success) {
      const info = await api.getUserInfo();

      if (info.success) {
        setUser(info.user);
      }
    }

    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register({
      name,
      email,
      password,
    });

    if (res.success) {
      const info = await api.getUserInfo();

      if (info.success) {
        setUser(info.user);
      }
    }

    return res;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
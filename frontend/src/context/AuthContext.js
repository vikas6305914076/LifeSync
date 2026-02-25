import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseStoredUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(parseStoredUser);

  const login = (authData) => {
    const nextUser = {
      name: authData.name,
      email: authData.email,
      familyId: authData.familyId,
      familyName: authData.familyName,
      familyRole: authData.familyRole
    };

    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(nextUser));

    setToken(authData.token);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

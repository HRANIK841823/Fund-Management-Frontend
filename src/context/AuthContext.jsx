import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { setUnauthorizedHandler, tokenStore } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // On first load, verify a stored token with the server.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // Any 401 from the API (expired token, removed account) logs the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (identifier, password) => {
    const res = await api.post("/auth/login", { identifier, password });
    tokenStore.set(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

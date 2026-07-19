import React, { createContext, useState, useEffect, useRef } from 'react';
import { LS_TOKEN_KEY, LS_USER_KEY } from '../config/config';
import * as authService from '../services/auth.service';
 
export const AuthContext = createContext();
 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);
 
  useEffect(() => {
    if (token) localStorage.setItem(LS_TOKEN_KEY, token);
    else localStorage.removeItem(LS_TOKEN_KEY);
  }, [token]);
 
  useEffect(() => {
    if (user) localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(LS_USER_KEY);
  }, [user]);
 
  async function refreshUser() {
    setLoading(true);
    try {
      const res = await authService.me();
      const payload = res?.data?.data?.user ?? res?.data?.data ?? res?.data ?? null;
      setUser(payload);
      setLoading(false);
      return payload;
    } catch (err) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return null;
    }
  }
 
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (token) {
      refreshUser();
    }
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  async function login(credentials) {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      // backend response: data: { accessToken, user }
      const accessToken = res?.data?.data?.accessToken ?? res?.data?.data?.accessToken ?? res?.data?.accessToken ?? null;
      const userPayload = res?.data?.data?.user ?? res?.data?.data ?? res?.data ?? null;
      if (accessToken) setToken(accessToken);
      if (userPayload) setUser(userPayload);
      setLoading(false);
      return { user: userPayload, token: accessToken };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }
 
  async function register(payload) {
    setLoading(true);
    try {
      const res = await authService.register(payload);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }
 
  function logout() {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_USER_KEY);
    } catch (e) {
      /* ignore */
    }
  }
 
  const isAuthenticated = Boolean(user);
 
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

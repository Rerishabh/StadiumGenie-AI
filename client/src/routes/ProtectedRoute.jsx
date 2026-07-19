import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
 
export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

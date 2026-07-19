import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Stadiums from '../pages/Stadiums';
import StadiumDetails from '../pages/StadiumDetails';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import Booking from '../pages/Booking';
import Payment from '../pages/Payment';
import Tickets from '../pages/Tickets';
import Profile from '../pages/Profile';
import VerifyTicket from '../pages/VerifyTicket';
import Privacy from '../pages/Privacy';
import AdminDashboard from '../pages/AdminDashboard';
import AdminStadiums from '../pages/AdminStadiums';
import AdminAddStadium from '../pages/AdminAddStadium';
import AdminEditStadium from '../pages/AdminEditStadium';
import AdminEvents from '../pages/AdminEvents';
import AdminAddEvent from '../pages/AdminAddEvent';
import AdminEditEvent from '../pages/AdminEditEvent';
import AdminBookings from '../pages/AdminBookings';
import AdminUsers from '../pages/AdminUsers';
import NotFound from '../pages/NotFound';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/stadiums" element={<Stadiums />} />
          <Route path="/stadiums/:id" element={<StadiumDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/verify-ticket/:ticketNumber" element={<VerifyTicket />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/booking" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/stadiums" element={<AdminStadiums />} />
            <Route path="/admin/stadiums/new" element={<AdminAddStadium />} />
            <Route path="/admin/stadiums/:id/edit" element={<AdminEditStadium />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/events/new" element={<AdminAddEvent />} />
            <Route path="/admin/events/:id/edit" element={<AdminEditEvent />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
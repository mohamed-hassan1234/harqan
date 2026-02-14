import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Measurements from './pages/Measurements';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/constants';

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <CustomerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/measurements"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <Measurements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;

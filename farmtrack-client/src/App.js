import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FlocksPage from './pages/flocks/FlocksPage';
import EggsPage from './pages/eggs/EggsPage';
import SalesPage from './pages/sales/SalesPage';
import WorkersPage from './pages/workers/WorkersPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import BirdSalesPage from './pages/birdsales/BirdSalesPage';
import ManureSalesPage from './pages/manuresales/ManureSalesPage';
import MortalityPage from './pages/mortality/MortalityPage';
import FarmProfilePage from './pages/settings/FarmProfilePage';
import Layout from './components/Layout';
import VerifyPage from './pages/verify/VerifyPage';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Segoe UI' }
        }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public receipt verification pages */}
          <Route path="/verify-sale/:id" element={<VerifyPage type="sale" />} />
          <Route path="/verify-birdsale/:id" element={<VerifyPage type="birdsale" />} />
          <Route path="/verify-manuresale/:id" element={<VerifyPage type="manuresale" />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="flocks" element={<FlocksPage />} />
            <Route path="eggs" element={<EggsPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="bird-sales" element={<BirdSalesPage />} />
            <Route path="manure-sales" element={<ManureSalesPage />} />
            <Route path="mortality" element={<MortalityPage />} />
            <Route path="settings" element={<FarmProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
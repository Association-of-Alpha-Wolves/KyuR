import { Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";
import NotificationToast from "./components/NotificationToast.jsx";

function PrivateRoute({ children }) {
  if (!localStorage.getItem("kyurToken")) {
    return <Navigate to="/login" replace />;
  }
  return (
    <SocketProvider>
      {children}
      <NotificationToast />
    </SocketProvider>
  );
}

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import BrowseItemsPage from "./BrowseItemPage/BrowseItemsPage.jsx";
import ReportItemPage from "./ReportItemPage/ReportItemPage.jsx";
import ItemDetailPage from "./ItemDetailPage/ItemDetailPage.jsx";
import ProfilePage from "./ProfilePage/ProfilePage.jsx";
import AdminDashboardPage from "./AdminDashboardPage/AdminDashboardPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/items" element={
        <SocketProvider>
          <BrowseItemsPage />
          <NotificationToast />
        </SocketProvider>
      } />
      <Route path="/items/report" element={<PrivateRoute><ReportItemPage /></PrivateRoute>} />
      <Route path="/items/:id" element={<PrivateRoute><ItemDetailPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppShell } from './pages/AppShell';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { PlaceholderPage } from './pages/Placeholder';
import { UnauthorizedPage } from './pages/Unauthorized';
import { MenuKey } from './lib/rbac-constants';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />

            {/* Each route below is gated on the exact MenuKey the backend
                also checks (via MenuGuard on the corresponding API), so a
                bookmarked or typed URL can't bypass the access matrix
                (AC-07). */}
            <Route
              path="/masters-policy"
              element={
                <ProtectedRoute menu={MenuKey.MASTERS_POLICY}>
                  <PlaceholderPage title="Masters & Policy" meta="Company Admin / Super Admin only" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting-sync"
              element={
                <ProtectedRoute menu={MenuKey.ACCOUNTING_SYNC}>
                  <PlaceholderPage title="Accounting Sync" meta="Company Admin / Finance Head only" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance-approval"
              element={
                <ProtectedRoute menu={MenuKey.FINANCE_APPROVAL_SETTLEMENT}>
                  <PlaceholderPage title="Finance Approval & Settlement" meta="Finance Head only" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute menu={MenuKey.MANAGER_HOD_APPROVALS}>
                  <PlaceholderPage title="Manager / HOD Approvals" meta="Any Approving Authority" />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Main pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Customer pages
import Customers from './pages/customers';
import CustomerDetail from './pages/customers/CustomerDetail';

// Material pages
import Materials from './pages/materials';

// Plan pages
import Plans from './pages/plans';

// Job pages
import Jobs from './pages/jobs';
import Takeoffs from './pages/jobs/Takeoffs';

// Transaction pages
import PurchaseOrders from './pages/purchase-orders';
import Schedule from './pages/schedule';

// Other pages
import Reports from './pages/reports';
import Settings from './pages/settings';

// Tools
import SpreadsheetExtractor from './pages/tools/SpreadsheetExtractor';

import './styles/App.css';
import './styles/design-system.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
            {/* Auth routes - public, no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main app routes - with layout and authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Foundation routes */}
            <Route
              path="/foundation/customers"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Customers />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/foundation/customers/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CustomerDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/foundation/plans"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Plans />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/foundation/materials"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Materials />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Operations routes */}
            <Route
              path="/operations/jobs"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Jobs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/takeoffs"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Takeoffs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Transaction routes */}
            <Route
              path="/transactions/purchase-orders"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PurchaseOrders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/schedule"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Schedule />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Other routes */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Tools routes */}
            <Route
              path="/tools/spreadsheet-extractor"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SpreadsheetExtractor />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
    </QueryClientProvider>
  );
}

export default App;

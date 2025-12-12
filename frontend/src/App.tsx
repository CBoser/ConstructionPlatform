import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';
import Loading from './components/common/Loading';

// Create the query client with mobile-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep cached data longer for offline
    },
  },
});

// Create localStorage persister for offline support
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'mindflow-query-cache',
  throttleTime: 1000, // Throttle writes to localStorage
});

// Page loading fallback component
const PageLoader: React.FC = () => (
  <div className="loading-page">
    <Loading size="lg" />
    <p className="loading-text">Loading...</p>
  </div>
);

// Lazy-loaded page components for code splitting
// Auth pages (smaller, load quickly)
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// Main pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Customer pages
const Customers = React.lazy(() => import('./pages/customers'));
const CustomerDetail = React.lazy(() => import('./pages/customers/CustomerDetail'));

// Material pages
const Materials = React.lazy(() => import('./pages/materials'));

// Plan pages
const Plans = React.lazy(() => import('./pages/plans'));

// Job pages
const Jobs = React.lazy(() => import('./pages/jobs'));
const Takeoffs = React.lazy(() => import('./pages/jobs/Takeoffs'));

// PDSS (Plan Data Status Sheet)
const PDSS = React.lazy(() => import('./pages/pdss'));

// Transaction pages
const PurchaseOrders = React.lazy(() => import('./pages/purchase-orders'));
const Schedule = React.lazy(() => import('./pages/schedule'));

// Other pages
const Reports = React.lazy(() => import('./pages/reports'));
const Settings = React.lazy(() => import('./pages/settings'));

// Tools
const SpreadsheetExtractor = React.lazy(() => import('./pages/tools/SpreadsheetExtractor'));
const DataImport = React.lazy(() => import('./pages/tools/DataImport'));

import './styles/App.css';
import './styles/design-system.css';

// Service Worker registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    });
  }
}

function App() {
  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: 'v1', // Change this to bust cache on app update
      }}
    >
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
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
                <Route
                  path="/operations/pdss"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PDSS />
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
                <Route
                  path="/tools/import"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DataImport />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 - Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </PersistQueryClientProvider>
  );
}

export default App;

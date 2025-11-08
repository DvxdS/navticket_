import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Landing from '@/pages/Landing';
import SearchResults from '@/pages/SearchResults';
import { TripDetailsPage } from '@/pages/TripDetailsPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentCancelPage } from './pages/PaymentCancelPage';

// Dashboard imports
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
// Import other dashboard pages when ready
 import { TripManagement } from '@/pages/dashboard/TripManagements';
 import { RouteManagement } from '@/pages/dashboard/RouteManagement';
 import { BookingManagement } from '@/pages/dashboard/BookingManagement';
 import { VoyagePage } from '@/pages/dashboard/VoyagePage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/trip/:tripId" element={<TripDetailsPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          
          { <Route path="trips" element={<TripManagement />} /> }
          { <Route path="routes" element={<RouteManagement />} /> }
          { <Route path="bookings" element={<BookingManagement />} /> }
          { <Route path="voyage" element={<VoyagePage />} /> }
          {/* <Route path="analytics" element={<Analytics />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;

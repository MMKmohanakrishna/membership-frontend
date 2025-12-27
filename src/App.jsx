import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Scanner from './pages/Scanner';
import Attendance from './pages/Attendance';
import Plans from './pages/Plans';
import Users from './pages/Users';
import Club from './pages/Club';
import Blocked from './pages/Blocked';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* Default root goes to login so external links open the login page */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/users" element={<Users />} />
                <Route path="/gyms" element={<Club />} />
                <Route path="/blocked" element={<Blocked />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

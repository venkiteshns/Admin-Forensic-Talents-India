import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import Courses from './pages/Courses';
import Internships from './pages/Internships';
import Quizzes from './pages/Quizzes';
import Resources from './pages/Resources';

// Protects admin routes from unauthenticated users
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('admin_token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Protects login page from authenticated users
const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('admin_token');
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="internships" element={<Internships />} />
          <Route path="quiz" element={<Quizzes />} />
          <Route path="resources" element={<Resources />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

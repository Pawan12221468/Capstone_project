import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import ChatPage from './pages/ChatPage';
import DemoModal from './components/DemoModal';
import RoadmapPage from './pages/RoadmapPage';
import TutorPage from './pages/TutorPage';
import QuizPage from './pages/QuizPage';
import DocumentPage from './pages/DocumentPage';
import TeacherDashboard from './pages/TeacherDashboard';

// Wrapper to selectively apply Layout based on route
const AppRoutes = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const location = useLocation();
  
  // Routes that shouldn't have the sidebar
  const publicRoutes = ['/', '/login', '/signup', '/about'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const routeContent = (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage onOpenDemo={() => setIsDemoOpen(true)} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/document/:id" element={<DocumentPage />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      <Route path="/tutor" element={<TutorPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/chat/:sessionId" element={<ChatPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );

  return (
    <>
      {isPublicRoute ? (
        <div className="min-h-screen flex flex-col font-sans">
          {routeContent}
        </div>
      ) : (
        <MainLayout>
          {routeContent}
        </MainLayout>
      )}
      
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

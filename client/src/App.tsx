import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Lazy loading page components for optimal bundle splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FeedbackManagement = lazy(() => import('./pages/FeedbackManagement'));
const TaskManagement = lazy(() => import('./pages/TaskManagement'));
const ChatInterface = lazy(() => import('./pages/ChatInterface'));
const RoadmapView = lazy(() => import('./pages/RoadmapView'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400">Loading workspace...</span>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected application layout routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects/:id" element={<Dashboard />} />

                  {/* Core modules */}
                  <Route path="chat" element={<ChatInterface />} />
                  <Route path="chat/:sessionId" element={<ChatInterface />} />
                  
                  <Route path="feedback" element={<FeedbackManagement />} />
                  <Route path="feedback/project/:projectId" element={<FeedbackManagement />} />
                  
                  <Route path="tasks" element={<TaskManagement />} />
                  <Route path="tasks/project/:projectId" element={<TaskManagement />} />
                  
                  <Route path="roadmap" element={<RoadmapView />} />
                  <Route path="roadmap/project/:projectId" element={<RoadmapView />} />
                  <Route path="roadmap/:roadmapId" element={<RoadmapView />} />
                  
                  <Route path="analytics" element={<Analytics />} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

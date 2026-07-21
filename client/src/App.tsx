import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import FeedbackManagement from './pages/FeedbackManagement';
import TaskManagement from './pages/TaskManagement';
import ChatInterface from './pages/ChatInterface';
import RoadmapView from './pages/RoadmapView';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
              
              {/* Project routes */}
              <Route path="projects/:id" element={<Dashboard />} />

              {/* Global core modules */}
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

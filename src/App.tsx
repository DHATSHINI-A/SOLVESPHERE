import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardShell } from './components/layout/DashboardShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public & Landing
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';

// Dashboards
import { MainDashboard } from './components/dashboards/MainDashboard';
import { CitizenDashboard } from './components/dashboards/CitizenDashboard';
import { UniversityDashboard } from './components/dashboards/UniversityDashboard';
import { IndustryDashboard } from './components/dashboards/IndustryDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';

// Problem Solving Pipeline
import { ProblemListing } from './components/problems/ProblemListing';
import { ProblemDetails } from './components/problems/ProblemDetails';
import { SubmitProblemPage } from './components/problems/SubmitProblemPage';
import { AIAnalysisPage } from './components/ai/AIAnalysisPage';
import { PartnerMatchingPage } from './components/ai/PartnerMatchingPage';

// Workspace & Deployment
import { CollaborationWorkspace } from './components/workspace/CollaborationWorkspace';
import { DeploymentPage } from './components/workspace/DeploymentPage';

// Impact & Utilities
import { ImpactDashboard } from './components/impact/ImpactDashboard';
import { ProfilePage } from './components/common/ProfilePage';
import { NotFoundPage } from './components/common/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        
        {/* Auth routes without full dashboard shell */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Main Application with Persistent Shell */}
        <Route element={<DashboardShell />}>
          
          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Problem Directory & Details */}
          <Route path="/problems" element={<ProblemListing />} />
          <Route path="/problems/new" element={<SubmitProblemPage />} />
          <Route path="/problems/:id" element={<ProblemDetails />} />
          <Route path="/problems/:id/analysis" element={<AIAnalysisPage />} />
          <Route path="/problems/:id/matches" element={<PartnerMatchingPage />} />

          {/* Collaboration Workspaces & Field Deployments */}
          <Route path="/collaboration/:projectId" element={<CollaborationWorkspace />} />
          <Route path="/collaboration/:projectId/deployment" element={<DeploymentPage />} />
          <Route path="/deployments" element={<DeploymentPage />} />

          {/* Public Impact Dashboard */}
          <Route path="/impact" element={<ImpactDashboard />} />

          {/* User Profile / Settings */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Role-Specific Guarded Dashboards — Users can only access the role they logged in as */}
          <Route path="/dashboard" element={<MainDashboard />} />
          
          <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
            <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['university']} />}>
            <Route path="/dashboard/university" element={<UniversityDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['industry']} />}>
            <Route path="/dashboard/industry" element={<IndustryDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />

        </Route>

      </Routes>
    </AuthProvider>
  );
};

export default App;

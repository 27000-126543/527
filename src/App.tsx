import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/Login';

import SellerDashboard from '@/pages/seller/Dashboard';
import SellerQualification from '@/pages/seller/Qualification';
import SellerProducts from '@/pages/seller/Products';
import SellerAppeals from '@/pages/seller/Appeals';
import SellerDeposit from '@/pages/seller/Deposit';

import ReviewerDashboard from '@/pages/reviewer/Dashboard';
import ReviewerQualificationReview from '@/pages/reviewer/QualificationReview';
import ReviewerInfringementReview from '@/pages/reviewer/InfringementReview';
import ReviewerAppealArbitration from '@/pages/reviewer/AppealArbitration';

import InspectorDashboard from '@/pages/inspector/Dashboard';
import InspectorTasks from '@/pages/inspector/Tasks';
import InspectorReports from '@/pages/inspector/Reports';

import IPOwnerDashboard from '@/pages/ip-owner/Dashboard';
import IPOwnerCertificates from '@/pages/ip-owner/Certificates';
import IPOwnerComplaints from '@/pages/ip-owner/Complaints';
import IPOwnerComplaintTracking from '@/pages/ip-owner/ComplaintTracking';

import FinanceDashboard from '@/pages/finance/Dashboard';
import FinanceRefundApproval from '@/pages/finance/RefundApproval';
import FinanceReports from '@/pages/finance/Reports';

import NotificationsPage from '@/pages/Notifications';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const roleHomeMap: Record<string, string> = {
    seller: '/seller',
    reviewer: '/reviewer',
    inspector: '/inspector',
    ip_owner: '/ip-owner',
    finance: '/finance',
  };
  return <Navigate to={roleHomeMap[user.role] ?? '/login'} replace />;
}

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<AuthRedirect />} />

          {/* Seller routes */}
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/qualification" element={<SellerQualification />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/appeals" element={<SellerAppeals />} />
          <Route path="/seller/deposit" element={<SellerDeposit />} />

          {/* Reviewer routes */}
          <Route path="/reviewer" element={<ReviewerDashboard />} />
          <Route path="/reviewer/qualification-review" element={<ReviewerQualificationReview />} />
          <Route path="/reviewer/infringement-review" element={<ReviewerInfringementReview />} />
          <Route path="/reviewer/appeal-arbitration" element={<ReviewerAppealArbitration />} />

          {/* Inspector routes */}
          <Route path="/inspector" element={<InspectorDashboard />} />
          <Route path="/inspector/tasks" element={<InspectorTasks />} />
          <Route path="/inspector/reports" element={<InspectorReports />} />

          {/* IP Owner routes */}
          <Route path="/ip-owner" element={<IPOwnerDashboard />} />
          <Route path="/ip-owner/certificates" element={<IPOwnerCertificates />} />
          <Route path="/ip-owner/complaints" element={<IPOwnerComplaints />} />
          <Route path="/ip-owner/complaint-tracking" element={<IPOwnerComplaintTracking />} />

          {/* Finance routes */}
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/refund-approval" element={<FinanceRefundApproval />} />
          <Route path="/finance/reports" element={<FinanceReports />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

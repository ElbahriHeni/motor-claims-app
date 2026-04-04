import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { ClaimLayout } from './components/ClaimLayout';

import WelcomePage from './pages/WelcomePage';
import ClaimDetailsPage from './pages/ClaimDetailsPage';
import VehicleInfoPage from './pages/VehicleInfoPage';
import UploadDocumentsPage from './pages/UploadDocumentsPage';
import ReviewPage from './pages/ReviewPage';
import SuccessPage from './pages/SuccessPage';

import FinanceQueuePage from './pages/finance/FinanceQueuePage';
import FinanceTaskPage from './pages/finance/FinanceTaskPage';

import MyClaimsPage from './pages/MyClaimsPage';
import ResubmitPage from './pages/ResubmitPage';

import { useUserContext } from './context/UserContext';

// ==========================
// ROLE-BASED REDIRECT
// ==========================
function RoleHomeRedirect() {
  const { currentUser } = useUserContext();

  if (!currentUser) return <Navigate to="/" replace />;

  if (
    currentUser.roleCode === 'FINANCE_MEMBER' ||
    currentUser.roleCode === 'FINANCE_SUPERVISOR'
  ) {
    return <Navigate to="/finance" replace />;
  }

  return <Navigate to="/my-claims" replace />;
}

// ==========================
// GUARDS
// ==========================
function RequireRequestor({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUserContext();

  const isAllowed =
    currentUser?.roleCode === 'REQUESTOR' ||
    currentUser?.roleCode === 'ADMIN';

  if (!isAllowed) return <Navigate to="/finance" replace />;

  return <>{children}</>;
}

function RequireFinance({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUserContext();

  const isAllowed =
    currentUser?.roleCode === 'FINANCE_MEMBER' ||
    currentUser?.roleCode === 'FINANCE_SUPERVISOR' ||
    currentUser?.roleCode === 'ADMIN';

  if (!isAllowed) return <Navigate to="/my-claims" replace />;

  return <>{children}</>;
}

// ==========================
// ROUTER
// ==========================
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RoleHomeRedirect />,
  },

  // ==========================
  // REQUESTOR FLOW (WIZARD)
  // ==========================
  {
    path: '/claim/start',
    element: (
      <RequireRequestor>
        <ClaimLayout currentStep={0} totalSteps={5} />
      </RequireRequestor>
    ),
    children: [{ index: true, element: <WelcomePage /> }],
  },
  {
    path: '/claim/details',
    element: (
      <RequireRequestor>
        <ClaimLayout currentStep={1} totalSteps={5} />
      </RequireRequestor>
    ),
    children: [{ index: true, element: <ClaimDetailsPage /> }],
  },
  {
    path: '/claim/vehicle',
    element: (
      <RequireRequestor>
        <ClaimLayout currentStep={2} totalSteps={5} />
      </RequireRequestor>
    ),
    children: [{ index: true, element: <VehicleInfoPage /> }],
  },
  {
    path: '/claim/upload',
    element: (
      <RequireRequestor>
        <ClaimLayout currentStep={3} totalSteps={5} />
      </RequireRequestor>
    ),
    children: [{ index: true, element: <UploadDocumentsPage /> }],
  },
  {
    path: '/claim/review',
    element: (
      <RequireRequestor>
        <ClaimLayout currentStep={4} totalSteps={5} />
      </RequireRequestor>
    ),
    children: [{ index: true, element: <ReviewPage /> }],
  },
  {
    path: '/claim/success',
    element: (
      <RequireRequestor>
        <ClaimLayout currentStep={5} totalSteps={5} />
      </RequireRequestor>
    ),
    children: [{ index: true, element: <SuccessPage /> }],
  },

  // ==========================
  // REQUESTOR
  // ==========================
  {
    path: '/my-claims',
    element: (
      <RequireRequestor>
        <MyClaimsPage />
      </RequireRequestor>
    ),
  },
  {
    path: '/resubmit/:id',
    element: (
      <RequireRequestor>
        <ResubmitPage />
      </RequireRequestor>
    ),
  },

  // ==========================
  // FINANCE
  // ==========================
  {
    path: '/finance',
    element: (
      <RequireFinance>
        <FinanceQueuePage />
      </RequireFinance>
    ),
  },
  {
    path: '/finance/tasks/:taskId',
    element: (
      <RequireFinance>
        <FinanceTaskPage />
      </RequireFinance>
    ),
  },
]);
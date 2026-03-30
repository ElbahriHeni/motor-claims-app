import { createBrowserRouter } from 'react-router';
import { ClaimLayout } from './components/ClaimLayout';

import WelcomePage from './pages/WelcomePage';
import ClaimDetailsPage from './pages/ClaimDetailsPage';
import VehicleInfoPage from './pages/VehicleInfoPage';
import UploadDocumentsPage from './pages/UploadDocumentsPage';
import ReviewPage from './pages/ReviewPage';
import SuccessPage from './pages/SuccessPage';

// ✅ Finance
import FinanceQueuePage from './pages/finance/FinanceQueuePage';
import FinanceTaskPage from './pages/finance/FinanceTaskPage';

// ✅ NEW: Requestor features
import MyClaimsPage from './pages/MyClaimsPage';
import ResubmitPage from './pages/ResubmitPage';

export const router = createBrowserRouter([
  // ==========================
  // REQUESTOR FLOW (WIZARD)
  // ==========================
  {
    path: '/',
    element: <ClaimLayout currentStep={0} totalSteps={5} />,
    children: [
      { index: true, element: <WelcomePage /> },
    ],
  },
  {
    path: '/claim/details',
    element: <ClaimLayout currentStep={1} totalSteps={5} />,
    children: [
      { index: true, element: <ClaimDetailsPage /> },
    ],
  },
  {
    path: '/claim/vehicle',
    element: <ClaimLayout currentStep={2} totalSteps={5} />,
    children: [
      { index: true, element: <VehicleInfoPage /> },
    ],
  },
  {
    path: '/claim/upload',
    element: <ClaimLayout currentStep={3} totalSteps={5} />,
    children: [
      { index: true, element: <UploadDocumentsPage /> },
    ],
  },
  {
    path: '/claim/review',
    element: <ClaimLayout currentStep={4} totalSteps={5} />,
    children: [
      { index: true, element: <ReviewPage /> },
    ],
  },
  {
    path: '/claim/success',
    element: <ClaimLayout currentStep={5} totalSteps={5} />,
    children: [
      { index: true, element: <SuccessPage /> },
    ],
  },

  // ==========================
  // ✅ REQUESTOR - MY CLAIMS
  // ==========================
  {
    path: '/my-claims',
    element: <MyClaimsPage />,
  },
  {
    path: '/resubmit/:id',
    element: <ResubmitPage />,
  },

  // ==========================
  // ✅ FINANCE MODULE
  // ==========================
  {
    path: '/finance',
    element: <FinanceQueuePage />,
  },
  {
    path: '/finance/tasks/:taskId',
    element: <FinanceTaskPage />,
  },
]);
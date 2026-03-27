import { createBrowserRouter } from 'react-router';
import { ClaimLayout } from './components/ClaimLayout';
import WelcomePage from './pages/WelcomePage';
import ClaimDetailsPage from './pages/ClaimDetailsPage';
import VehicleInfoPage from './pages/VehicleInfoPage';
import UploadDocumentsPage from './pages/UploadDocumentsPage';
import ReviewPage from './pages/ReviewPage';
import SuccessPage from './pages/SuccessPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ClaimLayout currentStep={0} totalSteps={5} />,
    children: [
      {
        index: true,
        element: <WelcomePage />,
      },
    ],
  },
  {
    path: '/claim/details',
    element: <ClaimLayout currentStep={1} totalSteps={5} />,
    children: [
      {
        index: true,
        element: <ClaimDetailsPage />,
      },
    ],
  },
  {
    path: '/claim/vehicle',
    element: <ClaimLayout currentStep={2} totalSteps={5} />,
    children: [
      {
        index: true,
        element: <VehicleInfoPage />,
      },
    ],
  },
  {
    path: '/claim/upload',
    element: <ClaimLayout currentStep={3} totalSteps={5} />,
    children: [
      {
        index: true,
        element: <UploadDocumentsPage />,
      },
    ],
  },
  {
    path: '/claim/review',
    element: <ClaimLayout currentStep={4} totalSteps={5} />,
    children: [
      {
        index: true,
        element: <ReviewPage />,
      },
    ],
  },
  {
    path: '/claim/success',
    element: <ClaimLayout currentStep={5} totalSteps={5} />,
    children: [
      {
        index: true,
        element: <SuccessPage />,
      },
    ],
  },
]);